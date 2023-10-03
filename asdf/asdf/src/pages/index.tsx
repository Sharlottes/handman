import { socket } from "../lib/socket";
import { useEffect, useState } from "react";

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
    <main>
      Hello World!
      <div>
        <p>games</p>
        <hr />
        <ul>
          {gameIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
