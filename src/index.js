import { Client, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { config } from "./config/index.js";
import { logger } from "./lib/logger.js";
import { startServer, stopServer, fetchInitialTasks } from "./server.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const eventsPath = join(process.cwd(), "src/events");
for (const file of readdirSync(eventsPath)) {
  if (!file.endsWith(".js")) continue;
  const mod = await import(`./events/${file}`);
  const event = mod?.default;
  if (!event || !event.name || typeof event.execute !== "function") {
    logger.warn({ file }, "Skipping invalid event module");
    continue;
  }
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on("clientReady", () => {
  logger.info({ bot: client.user.tag }, "Bot ready");
  config.botId = client.user.id;
});

//express server setup
startServer();

//fetch initial tasks from Laravel
(async () => {
  try {
    const ok = await fetchInitialTasks({ retries: 5, initialDelayMs: 1000 });
    if (!ok) {
      logger.warn(
        "Initial fetch failed. Bot will continue and rely on manual pushes or file contents."
      );
    }
  } catch (err) {
    logger.error({ err }, "Unexpected error during fetchInitialTasks");
  }

  await client.login(config.botToken);
})();

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err: err.message, stack: err.stack }, "Uncaught exception");
});

async function shutdown(signal) {
  try {
    logger.info({ signal }, "Shutting down...");
    stopServer();
    try {
      await client.destroy();
    } catch (_) {}
  } finally {
    process.exit(0);
  }
}

["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));
