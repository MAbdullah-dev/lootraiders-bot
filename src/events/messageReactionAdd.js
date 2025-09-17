import { Events } from "discord.js";
import { config } from "../config/index.js";
import { sendToLaravel } from "../services/laravelService.js";
import { logger } from "../lib/logger.js";
import { normalizePayload } from "../lib/normalizePayload.js";
import { buildReactionContext } from "../lib/contextBuilders.js";
import { matchReactionTask } from "../services/taskService.js";
import { handleLaravelResponse } from "../utils/responseHandler.js";

export default {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    const reactionTask = matchReactionTask(reaction, user);
    if (reactionTask) {
      const payload = normalizePayload({
        task: reactionTask,
        user,
        context: buildReactionContext(reaction),
      });

      logger.info(payload, "Reaction task matched");
      const res = await sendToLaravel(payload);
      const message = reaction.message;
      await handleLaravelResponse(message, res, reactionTask);
    }
  },
};
