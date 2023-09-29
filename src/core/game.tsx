function shuffle(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

class Game {
  readonly words: number[] = [];
  readonly correctWords: number[] = [];
  readonly misCorrectWords: number[] = [];

  constructor(readonly correctAnswer: string, wordAmount: number) {
    if (wordAmount < correctAnswer.length)
      throw new Error(
        "wordAmount shouldn't be less than correctAnswer's length"
      );

    // create words and shuffle it.
    for (let i = 0; i < wordAmount; i++) {
      if (i <= correctAnswer.length - 1) {
        const unicode = correctAnswer.charCodeAt(i);
        this.words.push(unicode);
      } else {
        this.words.push(
          this.words[Math.random() * this.words.length] +
            (Math.random() < 0.5 ? +1 : -1) * (Math.random() * 10 + 1)
        );
      }
    }
    shuffle(this.words);
  }

  try(wordUnicode: number) {}
}
