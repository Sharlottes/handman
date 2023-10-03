import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import "@/discord/GameCommands";
import dotenv from "dotenv";
dotenv.config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  botGuilds:
    process.env.NODE_ENV === "production"
      ? undefined
      : [process.env.TEST_GUILD_ID],
});

client
  .once("ready", async () => {
    console.log(
      `Discord bot has been logged in as ${client.user?.tag}(${client.application?.id})`
    );
    await client.clearApplicationCommands();
    await client.initApplicationCommands();
  })
  .on("interactionCreate", (interaction) => {
    client.executeInteraction(interaction);
  })
  .login(process.env.BOT_TOKEN)
  .catch(console.log);
