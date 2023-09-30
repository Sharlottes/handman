import type TypedEmitter from "typed-emitter";
import { shuffle } from "@/utils/shuffle";
import EventEmitter from "events";

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
  life = 8;
  gameEnd = false;

  constructor(readonly correctAnswer: string, dummyWordAmount = 5) {
    super();
    this.id = crypto.randomUUID();

    const correctAnswerCharArr = Array.from(correctAnswer);
    for (let i = 0; i < correctAnswerCharArr.length; i++) {
      // special unicode has multiple unicodes.
      this.correctAnswerWords.push(
        [...correctAnswerCharArr[i]].map((c) => c.charCodeAt(0))
      );
    }
    this.words.push(...this.correctAnswerWords);
    for (let i = 0; i < dummyWordAmount; i++) {
      // generate random dummy words
      const unicode = [...this.words[Math.random() * this.words.length]];
      unicode[Math.random() * unicode.length] +=
        (Math.random() < 0.5 ? +1 : -1) * (Math.random() * 10 + 1);
      this.words.push(unicode);
    }
    shuffle(this.words);
  }

  try(wordUnicode: UnicodeId) {
    const wordIndex = this.correctAnswerWords.findIndex((correctAnswerWord) =>
      correctAnswerWord.every((unicode, i) => unicode == wordUnicode[i])
    );
    const isFound = wordIndex !== -1;

    if (isFound) {
      this.correctWords.push(wordUnicode);
      this.words.splice(wordIndex);
    } else {
      this.life--;
      this.misCorrectWords.push(wordUnicode);
      if (this.life <= 0) this.gameEnd = true;
    }
    this.emit("WORD_TRIED", isFound);
    return isFound;
  }
}
