import { socket } from "../lib/socket";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { displaySupportedUnicode } from "../utils/displaySupportedUnicode";
import "./game.css";

interface WebsocketGamePayload {
  words: number[];
  correctWords: number[];
  misCorrectWords: number[];
  currentAnswer: string;
  life: number;
}

export default function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccessed, setIsSuccessed] = useState<boolean>();
  const successedRef = useRef<NodeJS.Timeout | null>(null);
  const [game, setGame] = useState<WebsocketGamePayload>();
  const [selectedCharPoint, setSelectedCharPoint] = useState<number>();

  const gameId = searchParams.get("id");

  useEffect(() => {
    socket.emit("join", gameId, (game: WebsocketGamePayload) => setGame(game));
    socket.on(
      "WORD_TRIED",
      (_: string, isSuccessed: boolean, game: WebsocketGamePayload) => {
        if (successedRef.current) clearTimeout(successedRef.current);

        setGame(game);
        setIsSuccessed(isSuccessed);
        successedRef.current = setTimeout(() => {
          setIsSuccessed(undefined);
          successedRef.current = null;
        }, 2000);
      }
    );
    socket.on("GAME_ENDED", (isWin: boolean, game: WebsocketGamePayload) => {
      setGame(game);
      navigate(`/gameEnd?isWin=${isWin ? "win" : "lose"}`);
    });
  }, []);

  if (!game) return <p>Loading...</p>;

  const handleWordClick = (wordCharPoint: number) => () =>
    setSelectedCharPoint((prev) =>
      prev == wordCharPoint ? undefined : wordCharPoint
    );

  const handleSubmitButton = () => {
    if (selectedCharPoint === undefined) return;
    socket.emit("WORD_TRIED", gameId, String.fromCodePoint(selectedCharPoint));
  };

  return (
    <div>
      <div className="image-container">
        <img
          alt={`hangman-${10 - game.life}`}
          src={`/images/${10 - game.life}.jpg`}
        />
        <p>life: {game.life}</p>
      </div>

      <hr />
      <div className="words-container">
        Answer: <code>{game.currentAnswer}</code>
      </div>
      <div className="words-container">
        given Words:{" "}
        {game.words.map((wordCharPoint) => (
          <code
            key={wordCharPoint}
            onClick={handleWordClick(wordCharPoint)}
            aria-selected={selectedCharPoint == wordCharPoint ? true : false}
          >
            {displaySupportedUnicode(wordCharPoint)}
          </code>
        ))}
      </div>
      <div className="button-container">
        <button
          className="submit-button"
          onClick={handleSubmitButton}
          disabled={selectedCharPoint === undefined}
        >
          Submit!
        </button>
        {isSuccessed !== undefined && (
          <caption data-is-correct={isSuccessed}>
            you {isSuccessed ? "correct!" : "incorrect!"}
          </caption>
        )}
      </div>
    </div>
  );
}
