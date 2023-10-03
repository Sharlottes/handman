import { GatewayIntentBits } from "discord.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Client } from "discordx";
import "@/discord/GameCommands";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { displaySupportedUnicode } from "./utils/displaySupportedUnicode";
import GameManager from "./core/GameManager";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
// for getting game list initially
app.get("/list", (_, res) => {
  res.json({ gameIds: Object.keys(GameManager.games) });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join", (gameId, callback) => {
    console.log("a user joined to", gameId);
    const game = GameManager.games[gameId];
    if (!game) return;

    const getGamePayload = (): WebsocketGamePayload => ({
      words: Array.from(game.words),
      correctWords: Array.from(game.correctWords),
      misCorrectWords: Array.from(game.misCorrectWords),
      life: game.life,
      currentAnswer: Array.from(game.correctAnswerWords)
        .map((answerCharPoint) =>
          game.correctWords.has(answerCharPoint)
            ? displaySupportedUnicode(answerCharPoint)
            : "_"
        )
        .join(""),
    });
    callback(getGamePayload());
    game.on("WORD_TRIED", (word, isSuccessed) => {
      socket.emit("WORD_TRIED", word, isSuccessed, getGamePayload());
    });
    game.once("GAME_ENDED", (isWin) => {
      socket.timeout(3000).emit("GAME_ENDED", isWin, getGamePayload());
    });
  });
  // for real-time game list updating
  GameManager.on("GAME_STARTED", (gameId) => {
    socket.emit("GAME_STARTED", gameId);
  });

  socket.on(
    "START_GAME",
    (
      correctAnswer: string,
      wordAmount: number,
      callback: (id: string) => void
    ) => {
      const game = GameManager.startGame(correctAnswer, wordAmount);
      callback(game.id);
    }
  );
  socket.on("WORD_TRIED", (gameId, word) => {
    GameManager.games[gameId].try(word);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

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
