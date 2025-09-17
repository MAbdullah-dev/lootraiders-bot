import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { config } from "../config/index.js"; 

const commands = [
  new SlashCommandBuilder()
    .setName("startlive")
    .setDescription("Start a live event in a channel")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to mark as live event")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("endlive")
    .setDescription("End the current live event")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("livestatus")
    .setDescription("Show the current live event status")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(config.botToken);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
})();
