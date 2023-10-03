import Swal from "sweetalert2";
import { socket } from "../lib/socket";
import { useEffect, useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

function App() {
  const [gameIds, setGameIds] = useState<Set<string>>(new Set());
  const navigator = useNavigate();

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

  const handleNewGame = async () => {
    const { value: formValues } = await Swal.fire<[string, string]>({
      title: "Setup game config",
      html: `
      <div class="swal-container">
        <label>answer:</label> <input id="swal-input1" class="swal2-input" style="display:block;">
      </div> 
      <div class="swal-container">
        <label>dummy words:</label> <input id="swal-input2" class="swal2-input" value="5">
      </div> 
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById("swal-input1") as HTMLInputElement)?.value,
          (document.getElementById("swal-input2") as HTMLInputElement)?.value,
        ];
      },
    });

    if (!formValues) return;

    socket.emit(
      "START_GAME",
      formValues[0],
      formValues[1],
      (gameId: string) => {
        navigator(`/game?id=${gameId}`);
      }
    );
  };

  return (
    <div>
      <header>
        <h1>Hangman</h1>
        <h3>- rooms -</h3>
        <button className="newgame-button" onClick={handleNewGame}>
          new game
        </button>
      </header>
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
