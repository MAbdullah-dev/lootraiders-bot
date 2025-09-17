// Message tasks 

export function buildMessageContext(message, botId) {
  return {
    channelId: message.channelId,
    messageId: message.id,
    content: message.content,
    attachments: message.attachments.map(a => ({
      id: a.id,
      url: a.url,
      contentType: a.contentType,
    })),
    threadId: message.channel?.isThread() ? message.channel.id : null,
    mentionedBot: message.mentions.has(botId),
    taskType: "message",
  };
}

// Attachtment Tasks

export function buildAttachmentContext(message) {
  return {
    channelId: message.channelId,
    messageId: message.id,
    attachments: message.attachments.map(a => ({
      id: a.id,
      url: a.url,
      contentType: a.contentType,
    })),
    threadId: message.channel?.isThread() ? message.channel.id : null,
    taskType: "attachment",
  };
}

// Reaction tasks

export function buildReactionContext(reaction) {
  return {
    channelId: reaction.message.channelId,
    messageId: reaction.message.id,
    emoji: reaction.emoji.name,
    taskType: "reaction",
  };
}

// Role tasks 

export function buildRoleContext(role) {
  return {
    roleId: role.id,
    roleName: role.name,
    roleColor: role.hexColor,
    rolePosition: role.position,
    roleCreatedAt: role.createdAt,
  };
}

// Reply Tasks

export function buildReplyContext(message) {
  return {
    channelId: message.channelId,
    messageId: message.id,
    referencedMessageId: message.reference?.messageId || null,
    content: message.content,
    taskType: "reply",
  };
}
