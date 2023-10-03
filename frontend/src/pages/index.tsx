import { socket } from "../lib/socket";
import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [gameIds, setGameIds] = useState<string[]>([]);

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
      .then(({ gameIds }) => setGameIds(gameIds));

    socket.on("GAME_STARTED", (gameId) => {
      setGameIds((prev) => [...prev, gameId]);
    });
  }, []);

  return (
    <div>
      <h1 className="title">games</h1>
      <hr />
      <div className="game-items-container">
        {gameIds.map((id) => (
          <a key={id} className="game-item" href={`/game?id=${id}`}>
            {id}
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
