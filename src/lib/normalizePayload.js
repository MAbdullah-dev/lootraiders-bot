export function normalizePayload({ task, user, context }) {
  return {
    taskId: task.id, // internal identifier
    task_id: task.task_id, // database task id
    type: task.type,
    user: {
      id: user.id,
      username: user.username || user.tag,
    },
    metadata: {
      channelId: context.channelId || null,
      messageId: context.messageId || null,
      emoji: context.emoji || null,
      content: context.content || null,
      roleId: context.roleId || null,
      attachments: context.attachments || [],
      threadId: context.threadId || null,
      mentionedBot: context.mentionedBot || false,
      eventId: context.eventId || null,
      taskType: context.taskType || null,   
    },
    reward: task.reward,
    timestamp: new Date().toISOString(),
  };
}
