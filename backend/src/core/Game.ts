import { displaySupportedUnicode } from "@/utils/displaySupportedUnicode";
import type TypedEmitter from "typed-emitter";
import { shuffle } from "@/utils/shuffle";
import EventEmitter from "events";
import crypto from "crypto";

type EventsMap = {
  WORD_TRIED: (word: string, isCorrect: boolean) => void;
  GAME_ENDED: (isWin: boolean) => void;
};

export default class Game extends (EventEmitter as new () => TypedEmitter<EventsMap>) {
  readonly id: string;
  readonly words: Set<number>;
  readonly correctAnswerWords: Set<number>;

  correctWords: Set<number> = new Set();
  misCorrectWords: Set<number> = new Set();
  users: User[] = [];
  life = 10;
  gameEnd = false;

  constructor(
    readonly correctAnswer: string,
    dummyWordAmount = 5
  ) {
    super();
    this.id = crypto.randomUUID();
    this.life = Math.min(this.life, dummyWordAmount);

    // because some platform don't accept blank input, i decided to use alternation.
    correctAnswer = correctAnswer.replaceAll(" ", "_");
    this.correctAnswerWords = new Set(
      [...correctAnswer].map((cp) => cp.codePointAt(0)!)
    );

    const tempWordArr = Array.from(this.correctAnswerWords);
    // generate random dummy words
    for (let i = 0; i < dummyWordAmount; i++) {
      // prevent duplicated words
      while (true) {
        const codePoint =
          tempWordArr[~~(Math.random() * tempWordArr.length)] +
          (Math.random() < 0.5 ? +1 : -1) * ~~(Math.random() * 10 + 1);

        if (!this.correctAnswerWords.has(codePoint)) {
          tempWordArr.push(codePoint);
          break;
        }
      }
    }
    shuffle(tempWordArr);
    this.words = new Set(tempWordArr);
  }

  try(char: string) {
    const charPoint = char.codePointAt(0)!;
    const idxInWords = this.words.has(charPoint);
    if (!idxInWords) {
      throw new Error(
        "cannot find such word in the given words: " +
          displaySupportedUnicode(charPoint)
      );
    }
    this.words.delete(charPoint);

    const isFound = !!this.correctAnswerWords.has(charPoint);
    if (isFound) {
      this.correctWords.add(charPoint);
    } else {
      this.life--;
      this.misCorrectWords.add(charPoint);
    }
    this.emit("WORD_TRIED", char, isFound);

    const isGameEnd = this.isGameEnd();
    if (isGameEnd !== undefined) {
      this.emit("GAME_ENDED", isGameEnd == "win");
    }
    return isFound;
  }

  isGameEnd(): "win" | "lose" | undefined {
    if (
      Array.from(this.correctAnswerWords).every((answerCharPoint) =>
        this.correctWords.has(answerCharPoint)
      )
    ) {
      return "win";
    }
    if (this.life <= 0) {
      return "lose";
    }
  }
}
