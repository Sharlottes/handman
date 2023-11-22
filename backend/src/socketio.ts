import { Server } from "socket.io";

import { displaySupportedUnicode } from "./utils/displaySupportedUnicode";
import GameManager from "./core/GameManager";
import server from "./server";

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join", (gameId, callback) => {
    console.log("a user joined to", gameId);
    const game = GameManager.games[gameId];
    if (!game) {
      console.warn("[WARN] the game is not found!");
      return;
    }
    const getGamePayload = (): WebsocketGamePayload => ({
      words: Array.from(game.words),
      correctWords: Array.from(game.correctWords),
      misCorrectWords: Array.from(game.misCorrectWords),
      life: game.life,
      currentAnswer: Array.from(game.correctAnswerWords)
        .map((answerCharPoint) =>
          game.correctWords.has(answerCharPoint) ? displaySupportedUnicode(answerCharPoint) : "_"
        )
        .join(""),
    });

    // arduino dosen't support acknowledged callback
    callback?.(getGamePayload());
    socket.emit("USER_JOINED", gameId, getGamePayload());

    game.on("WORD_TRIED", (word, isSuccessed) => {
      socket.emit("WORD_TRIED", word, isSuccessed, getGamePayload());
    });
    game.once("GAME_ENDED", (isWin) => {
      socket.timeout(3000).emit("GAME_ENDED", isWin, getGamePayload());
    });
  });
  // for real-time game list updating
  GameManager.on("GAME_STARTED", (gameId) => {
    socket.emit("GAME_STARTED", gameId, { foo: "bar" });
  });

  socket.on("START_GAME", (correctAnswer: string, wordAmount: number, callback: (id: string) => void) => {
    const game = GameManager.startGame(correctAnswer, wordAmount);
    callback(game.id);
  });
  socket.on("WORD_TRIED", (gameId, word) => {
    GameManager.games[gameId].try(word);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
