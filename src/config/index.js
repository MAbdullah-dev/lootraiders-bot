import dotenv from "dotenv";
import { createRequire } from "module";
import { watchFile } from "fs";
import { join } from "path";
import { logger } from "../lib/logger.js";

dotenv.config();

const require = createRequire(import.meta.url);
const tasksPath = join(process.cwd(), "src/config/tasks.json");

let tasks = require("./tasks.json");

watchFile(tasksPath, () => {
	delete require.cache[require.resolve("./tasks.json")];
	tasks = require("./tasks.json");
	logger.info("Tasks reloaded from tasks.json");
});

function requireEnv(name) {
	const value = process.env[name];
	if (!value || value.trim() === "") {
		logger.error({ env: name }, "Missing required environment variable");
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const config = {
	botToken: requireEnv("BOT_TOKEN"),
	clientId: requireEnv("CLIENT_ID"),
	botSecret: requireEnv("BOT_SECRET"),
	laravelApiUrl: requireEnv("LARAVEL_API_URL"),
	tasksApiKey: requireEnv("DISCORD_BOT_TASKS_API_KEY"),
	linkUrl: process.env.LINK_URL || "http://127.0.0.1:8000/auth/discord",
	get tasks() {
		return tasks;
	},
};
