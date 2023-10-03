import type TypedEmitter from "typed-emitter";
import EventEmitter from "events";

import Game from "./Game";
import GameEmbedManager from "@/discord/GameEmbedManager";

type EventsMap = {
  GAME_STARTED: (gameId: string) => void;
};

class GameManager extends (EventEmitter as new () => TypedEmitter<EventsMap>) {
  public readonly games: Record<string, Game> = {};

  public startGame(correctAnswer: string, wordAmount?: number) {
    const game = new Game(correctAnswer, wordAmount);
    this.games[game.id] = game;
    this.emit("GAME_STARTED", game.id);
    GameEmbedManager.onGameStarted(game.id);
    game.once("GAME_ENDED", () => {
      delete this.games[game.id];
    });
    return game;
  }

  public getGameList() {
    return Object.values(this.games);
  }
}

export default new GameManager();
