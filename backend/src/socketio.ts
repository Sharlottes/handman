import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

import { displaySupportedUnicode } from "./utils/displaySupportedUnicode";
import GameManager from "./core/GameManager";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
// for getting game list initially
app.get("/list", (_, res) => {
  res.json({ gameIds: Object.keys(GameManager.games) });
});
app.get("/", (_, res) => {
  res.status(200).setHeader("Content-Type", "text/plain").send("OK");
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

server.listen(8000, () => {
  console.log("server running at http://localhost:8000");
});
