import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { logger } from "../lib/logger.js";
import { config } from "../config/index.js";

export async function handleLaravelResponse(message, res, task) {
  try {
    switch (res.code) {
      case "REWARDED": {
        const ticketWord = task.reward === 1 ? "ticket" : "tickets";
        await message.author.send(
          `✅ Verified! +${task.reward} ${ticketWord} awarded.`
        );
        logger.info(
          { code: res.code, taskId: task.task_id, userId: message.author?.id },
          "Task rewarded"
        );
        break;
      }

      case "ALREADY_COMPLETED": {
        await message.author.send(
          "⏳ You’ve already completed this task. No tickets awarded."
        );
        logger.info(
          { code: res.code, taskId: task.task_id, userId: message.author?.id },
          "Task already completed"
        );
        break;
      }

      case "USER_NOT_LINKED": {
        const embed = new EmbedBuilder()
          .setColor(0xffa500)
          .setTitle("⚠️ Account Not Linked")
          .setDescription(
            "You need to link your Discord account with our website before you can earn tickets."
          );

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("🔗 Link Account")
            .setStyle(ButtonStyle.Link)
            .setURL(config.linkUrl)
        );

        console.log('=== LINK URL DEBUG ===');
        console.log('config.linkUrl:', config.linkUrl);
        console.log('typeof linkUrl:', typeof config.linkUrl);
        console.log('linkUrl length:', config.linkUrl?.length);
        console.log('========================');

        try {
          if (message.author) {
            await message.author.send({ embeds: [embed], components: [row] });
          } else {
            logger.warn(
              { code: res.code },
              "Cannot send DM - message.author is null"
            );
          }
        } catch (dmError) {
          logger.error(
            { code: res.code, dmError: dmError.message },
            "Failed to send DM"
          );
        }

        logger.warn(
          { code: res.code, userId: message.author?.id },
          "User not linked"
        );
        break;
      }

      case "TASK_NOT_FOUND": {
        await message.author.send(
          "⚠️ That task no longer exists or is inactive."
        );
        logger.warn({ code: res.code, taskId: task.task_id }, "Task not found");
        break;
      }

      case "INVALID_SIGNATURE":
      case "INVALID_PAYLOAD":
      case "SERVER_ERROR": {
        await message.author.send(
          "🚨 Something went wrong while processing your task. Please try again later."
        );
        logger.error(
          { code: res.code, taskId: task.task_id },
          "Task processing failed"
        );
        break;
      }

      default: {
        logger.warn(
          { code: res?.code, taskId: task?.task_id },
          "Unhandled Laravel response code"
        );
        await message.author.send("⚠️ Unexpected response from server.");
      }
    }
  } catch (err) {
    logger.error(
      { message: err?.message, taskId: task?.task_id },
      "Failed to send Discord DM"
    );
  }
}
