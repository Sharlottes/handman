import { socket } from "../lib/socket";
import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [gameIds, setGameIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.API_ENDPOINT
          : "http://localhost:3000"
      }/list`
    )
      .then((res) => res.json())
      .catch(() => ({ gameIds: [] }))
      .then(({ gameIds }) => setGameIds(new Set(gameIds)));

    socket.on("GAME_STARTED", (gameId) => {
      setGameIds((prev) => new Set([...prev, gameId]));
    });
  }, []);

  return (
    <div>
      <h1 className="title">games</h1>
      <hr />
      <div className="game-items-container">
        {Array.from(gameIds).map((id) => (
          <a key={id} className="game-item" href={`/game?id=${id}`}>
            {id}
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
