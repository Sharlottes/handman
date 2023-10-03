type UnicodeId = number[];

interface User {
  id: string;
}

interface WebsocketGamePayload {
  words: number[];
  correctWords: number[];
  misCorrectWords: number[];
  currentAnswer: string;
  life: number;
}
