import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        target: "pino/file",
        options: { destination: "./logs/app.log", mkdir: true, append: true },
      },
    ],
  },
});
