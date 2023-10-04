export function getRootDomain(forClient = false) {
  if (forClient) {
    return process.env.NODE_ENV === "production"
      ? "https://sharlottes.github.io/handman"
      : "http://localhost:5173/handman";
  }
  return process.env.NODE_ENV === "production"
    ? "https://hangman-sharlottes.koyeb.app"
    : "http://localhost:8000";
}
