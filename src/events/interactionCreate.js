import { Events } from "discord.js";
import * as liveEventService from "../services/liveEventService.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === "startlive") {
      const channel = interaction.options.getChannel("channel");
      liveEventService.startLive(interaction.guildId, channel.id, interaction.user.id);
      await interaction.reply({
        content: `✅ Live event started for ${channel}. Use /endlive to stop.`,
        ephemeral: true
      });
    }

    if (commandName === "endlive") {
      const info = liveEventService.endLive(interaction.guildId);
      if (!info) {
        await interaction.reply({ content: "No active live event found.", ephemeral: true });
      } else {
        await interaction.reply({
          content: `⏹ Live event ended for <#${info.channelId}> (started by <@${info.startedBy}>).`,
          ephemeral: true
        });
      }
    }

    if (commandName === "livestatus") {
      const info = liveEventService.getLiveInfo(interaction.guildId);
      if (!info) {
        await interaction.reply({ content: "No live event active right now.", ephemeral: true });
      } else {
        await interaction.reply({
          content: `🔴 Live is active in <#${info.channelId}> (started by <@${info.startedBy}> at ${info.startedAt}).`,
          ephemeral: true
        });
      }
    }
  },
};
