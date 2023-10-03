import { GatewayIntentBits } from "discord.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Client } from "discordx";
import "@/discord/GameCommands";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

// TODO: impl API
app.get("/", (req, res) => {});

// TODO: impl Socket.io
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

// TODO: impl Discord.js commands
const client = new Client({
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
    await client.initApplicationCommands();
  })
  .on("interactionCreate", (interaction) => {
    client.executeInteraction(interaction);
  })
  .login(process.env.BOT_TOKEN)
  .catch(console.log);

process
  .on("unhandledRejection", async (err) => {
    console.error(
      `[${new Date().toISOString()}] Unhandled Promise Rejection:\n`,
      err
    );
  })
  .on("uncaughtException", async (err) => {
    console.error(
      `[${new Date().toISOString()}] Uncaught Promise Exception:\n`,
      err
    );
  })
  .on("uncaughtExceptionMonitor", async (err) => {
    console.error(
      `[${new Date().toISOString()}] Uncaught Promise Exception (Monitor):\n`,
      err
    );
  });
