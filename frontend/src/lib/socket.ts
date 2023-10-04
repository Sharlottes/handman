import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? process.env.API_ENDPOINT!
    : "http://localhost:3000";

export const socket = io(URL);
