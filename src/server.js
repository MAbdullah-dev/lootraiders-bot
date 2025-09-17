import express from "express";
import helmet from "helmet";
import { join } from "path";
import { writeFileSync, renameSync } from "fs";
import axios from "axios";
import { logger } from "./lib/logger.js";
import { config } from "./config/index.js";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "256kb" }));

const FILE_PATH = join(process.cwd(), "src/config/tasks.json");
const TEMP_PATH = FILE_PATH + ".tmp";

//atomic write helper
function saveTasksAtomic(tasks) {
  writeFileSync(TEMP_PATH, JSON.stringify(tasks, null, 2), "utf8");
  renameSync(TEMP_PATH, FILE_PATH);
  logger.info({ count: tasks.length }, "Tasks written atomically to disk");
}

//health endpoints
app.get("/healthz", (req, res) => res.status(200).send("ok"));
app.get("/readyz", (req, res) => res.status(200).send("ready"));

//incoming tasks from Laravel
app.post("/update-tasks", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${config.tasksApiKey}`) {
    logger.warn({ path: "/update-tasks" }, "Unauthorized request");
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const tasks = req.body;

    if (!Array.isArray(tasks)) {
      logger.warn({ path: "/update-tasks" }, "Invalid payload: tasks must be an array");
      return res.status(400).json({ error: "Tasks must be an array" });
    }

    logger.info({ count: tasks.length }, "Tasks received from Laravel");

    const validTasks = tasks.filter((t) => t.id != null);
    saveTasksAtomic(validTasks);
    logger.info(
      { count: validTasks.length },
      "Tasks updated via /update-tasks"
    );

    return res.json({ success: true, count: validTasks.length });
  } catch (err) {
    logger.error({ err: err.message, path: "/update-tasks" }, "Failed to update tasks");
    return res.status(500).json({ error: "Failed to update tasks" });
  }
});

let server;
export function startServer() {
  const port = process.env.PORT || 4000;
  server = app.listen(port, () => {
    logger.info({ port }, `Express server running`);
  });
}

export function stopServer() {
  if (server) {
    server.close(() => logger.info("Express server closed"));
  }
}

export async function fetchInitialTasks({
  retries = 5,
  initialDelayMs = 1000,
} = {}) {
  const laravelUrl = (config.laravelApiUrl || "").replace(/\/$/, "");
  const url = `${laravelUrl}/api/discord-native-tasks`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(
        { attempt, url },
        "Fetching initial discord_native tasks from Laravel"
      );
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${config.tasksApiKey}`,
        },
        timeout: 10_000, //10secs
      });

      if (!Array.isArray(res.data)) {
        logger.warn(
          { status: res.status },
          "Laravel returned non-array"
        );
        throw new Error("Laravel response is not an array");
      }

      //save atomically -> watchfile in config will reload in-memory tasks
      saveTasksAtomic(res.data);
      logger.info(
        { count: res.data.length },
        "Initial discord_native tasks fetched and saved"
      );
      return true;
    } catch (err) {
      const wait = initialDelayMs * Math.pow(2, attempt - 1);
      logger.warn(
        { attempt, wait, message: err.message },
        "Failed to fetch initial tasks, retrying"
      );
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  logger.error("Failed to fetch initial discord_native tasks after retries");
  return false;
}
