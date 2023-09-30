import EventEmitter from "events";
import Game from "./Game";
import type TypedEmitter from "typed-emitter";

type EventsMap = {
  GAME_STARTED: (gameId: string) => void;
  GAME_ENDED: (gameId: string) => void;
};

class GameManager extends (EventEmitter as new () => TypedEmitter<EventsMap>) {
  public readonly games: Record<string, Game> = {};

  public startGame(correctAnswer: string, wordAmount?: number) {
    const game = new Game(correctAnswer, wordAmount);
    this.games[game.id] = game;
    this.emit("GAME_STARTED", game.id);
  }

  public endGame(id: string) {
    delete this.games[id];
    this.emit("GAME_ENDED", id);
  }

  public getGameList() {
    return Object.values(this.games);
  }
}

export default new GameManager();