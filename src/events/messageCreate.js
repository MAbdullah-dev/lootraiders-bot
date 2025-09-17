import { Events } from "discord.js";
import { config } from "../config/index.js";
import { sendToLaravel } from "../services/laravelService.js";
import { logger } from "../lib/logger.js";
import { normalizePayload } from "../lib/normalizePayload.js";
import { buildMessageContext, buildReplyContext, buildAttachmentContext  } from "../lib/contextBuilders.js";

import {
  matchMessageTask,
  matchAttachmentTask,
  matchReplyTask,
  matchThreadTask,
  matchMentionTask,
  matchLiveEventTask,
} from "../services/taskService.js";
import { handleLaravelResponse } from "../utils/responseHandler.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    // Message task
    const messageTask = matchMessageTask(message);
    if (messageTask) {
      const payload = normalizePayload({
        task: messageTask,
        user: message.author,
        context: buildMessageContext(message, config.botId),
      });

      logger.info(payload, "Message task matched");
      const res = await sendToLaravel(payload);

      await handleLaravelResponse(message, res, messageTask);
    }

    // Attachment task
    const attachmentTask = matchAttachmentTask(message);
    if (attachmentTask) {
      const payload = normalizePayload({
        task: attachmentTask,
        user: message.author,
        context: buildAttachmentContext(message),
      });

      logger.info(payload, "Attachment task matched");
      const res = await sendToLaravel(payload);

      await handleLaravelResponse(message, res, attachmentTask);
    }

    // Reply to bot task
    const replyTask = matchReplyTask(message);
    if (replyTask) {
      const payload = normalizePayload({
        task: replyTask,
        user: message.author,
        context: buildReplyContext(message),
      });

      logger.info(payload, "Reply task matched");

      const res = await sendToLaravel(payload);
      await handleLaravelResponse(message, res, replyTask);
    }

    // Thread participation task
    const threadTask = matchThreadTask(message);
    if (threadTask) {
      const payload = normalizePayload({
        task: threadTask,
        user: message.author,
        context: buildMessageContext(message, config.botId),
      });

      logger.info(payload, "Thread task matched");
      const res = await sendToLaravel(payload);
      await handleLaravelResponse(message, res, threadTask);
    }

    // Mention bot task
    const mentionTask = matchMentionTask(message, config.botId);
    if (mentionTask) {
      const payload = normalizePayload({
        task: mentionTask,
        user: message.author,
        context: buildMessageContext(message, config.botId),
      });

      logger.info(payload, "Mention task matched");
      const res = await sendToLaravel(payload);
      await handleLaravelResponse(message, res, mentionTask);
    }

    // Live Event task
    const liveEventTask = matchLiveEventTask(message);
    if (liveEventTask) {
      const payload = normalizePayload({
        task: liveEventTask,
        user: message.author,
        context: buildMessageContext(message, config.botId),
      });

      logger.info(payload, "Live event task matched");
      const res = await sendToLaravel(payload);
      await handleLaravelResponse(message, res, liveEventTask);
    }
  },
};
