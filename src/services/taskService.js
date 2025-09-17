import { config } from "../config/index.js";
import * as liveEventService from "./liveEventService.js";

// Match message-based task
export function matchMessageTask(message) {
  return config.tasks.find(
    (task) =>
      task.type === "message" &&
      task.channelId === message.channelId &&
      message.content.toLowerCase().includes(task.match.toLowerCase())
  );
}

// Find matching reaction-based task
export function matchReactionTask(reaction, user) {
  return config.tasks.find(
    (task) =>
      task.type === "reaction" &&
      task.messageId === reaction.message.id &&
      reaction.emoji.name === task.emoji
  );
}

// Find matching attachment-based task
export function matchAttachmentTask(message) {
  return config.tasks.find(
    (task) =>
      task.type === "attachment" &&
      task.channelId === message.channelId &&
      message.attachments.size > 0
  );
}

// Find matching role-based task
export function matchRoleTask(roleId) {
  return config.tasks.find(
    (task) => task.type === "role" && task.roleId === roleId
  );
}

// Find matching join-based task
export function matchJoinTask() {
  return config.tasks.find((task) => task.type === "join");
}

// Find matching reply-to-a-specific-message task
export function matchReplyTask(message) {
  return config.tasks.find(
    (task) =>
      task.type === "reply" &&
      task.parentMessageId &&
      message.reference?.messageId === task.parentMessageId
  );
}

// Find matching thread-based task
export function matchThreadTask(message) {
  return config.tasks.find(
    (task) =>
      task.type === "thread" &&
      message.channel.isThread() &&
      (task.threadId ? message.channel.id === task.threadId : true)
  );
}

// Find matching mention-based task
export function matchMentionTask(message, botId) {
  return config.tasks.find(
    (task) =>
      task.type === "mention" &&
      task.channelId === message.channelId &&
      message.mentions.has(botId)
  );
}

// Find matching live event task
export function matchLiveEventTask(message) {
  if (!message.guildId) return undefined;

  const info = liveEventService.getLiveInfo(message.guildId);
  if (!info || !info.active) return undefined;

  // only count if message is in the active live channel
  if (info.channelId !== message.channelId) return undefined;

  return config.tasks.find((task) => task.type === "live_event");
}
