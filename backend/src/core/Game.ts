import type TypedEmitter from "typed-emitter";

import { isUnicodeEqual } from "@/utils/isUnicodeEqual";
import { shuffle } from "@/utils/shuffle";
import GameManager from "./GameManager";
import EventEmitter from "events";
import crypto from "crypto";

type EventsMap = {
  WORD_TRIED: (isCorrect: boolean) => void;
};

export default class Game extends (EventEmitter as new () => TypedEmitter<EventsMap>) {
  readonly id: string;
  readonly words: UnicodeId[] = [];
  readonly correctAnswerWords: UnicodeId[] = [];

  correctWords: UnicodeId[] = [];
  misCorrectWords: UnicodeId[] = [];
  users: User[] = [];
  life = 10;
  gameEnd = false;

  constructor(
    readonly correctAnswer: string,
    dummyWordAmount = 5
  ) {
    super();
    // because some platform don't accept blank input, i decided to use alternation.
    correctAnswer = correctAnswer.replaceAll(" ", "_");
    this.id = crypto.randomUUID();
    this.life = Math.min(this.life, dummyWordAmount);

    const correctAnswerCharArr = Array.from(correctAnswer);
    for (let i = 0; i < correctAnswerCharArr.length; i++) {
      // special unicode has multiple unicodes.
      this.correctAnswerWords.push(
        [...correctAnswerCharArr[i]].map((c) => c.charCodeAt(0))
      );
    }

    for (const unicode of this.correctAnswerWords) {
      if (this.words.find((uni) => isUnicodeEqual(uni, unicode))) continue;
      this.words.push(unicode);
    }

    // generate random dummy words
    for (let i = 0; i < dummyWordAmount; i++) {
      // prevent duplicated words
      while (true) {
        const unicode = [...this.words[~~(Math.random() * this.words.length)]];
        unicode[~~(Math.random() * unicode.length)] +=
          (Math.random() < 0.5 ? +1 : -1) * ~~(Math.random() * 10 + 1);

        if (
          !this.correctAnswerWords.find((uni) => isUnicodeEqual(uni, unicode))
        ) {
          this.words.push(unicode);
          break;
        }
      }
    }
    shuffle(this.words);
  }

  try(word: string) {
    const wordUnicode = [...word].map((c) => c.charCodeAt(0));
    if (!this.words.find((wordUni) => isUnicodeEqual(wordUnicode, wordUni))) {
      throw new Error("cannot find such word in the given words: " + word);
    }

    const isFound = !!this.correctAnswerWords.find((correctAnswerWord) =>
      isUnicodeEqual(correctAnswerWord, wordUnicode)
    );

    if (isFound) {
      this.correctWords.push(wordUnicode);
      const idxInWords = this.words.findIndex((wordsUnicode) =>
        isUnicodeEqual(wordsUnicode, wordUnicode)
      );
      this.words.splice(idxInWords, 1);
      if (
        this.correctAnswerWords.every(
          (answerUnicode) =>
            !!this.correctWords.find((unicode) =>
              isUnicodeEqual(unicode, answerUnicode)
            )
        )
      ) {
        GameManager.endGame(this.id, true);
      }
    } else {
      this.life--;
      this.misCorrectWords.push(wordUnicode);
      if (this.life <= 0) GameManager.endGame(this.id, false);
    }
    this.emit("WORD_TRIED", isFound);
    return isFound;
  }
}
