import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JSConfetti from "js-confetti";
import "./gameEnd.css";

export default function GameEnd() {
  const [searchParams] = useSearchParams();
  const isWin = searchParams.get("isWin") == "win" ? true : false;
  const jsConfetti = new JSConfetti();

  //색종이 커스터마이징
  useEffect(() => {
    if (!isWin) return;
    const id = setInterval(() => {
      jsConfetti.addConfetti({
        confettiColors: [
          "#e37056",
          "#d056e3",
          "#24e0c7",
          "#bce80e",
          "#0ee84c",
          "#e80e3d",
        ],
        confettiRadius: 5,
        confettiNumber: 500,
      });
    }, Math.random() * 1000 + 500);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="page-container">
      <h1>you {isWin ? "Win!" : "lose..."}</h1>
      <a href="/">back to main</a>
    </div>
  );
}
