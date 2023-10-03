import "./socketio";
import "./discord";
import { createServer } from "node:http";

process
  .on("unhandledRejection", async (err) => {
    console.error(
      `[${new Date().toISOString()}] Unhandled Promise Rejection:\n`,
      err
    );
  })
  .on("uncaughtException", async (err) => {
    console.error(
      `[${new Date().toISOString()}] Uncaught Promise Exception:\n`,
      err
    );
  })
  .on("uncaughtExceptionMonitor", async (err) => {
    console.error(
      `[${new Date().toISOString()}] Uncaught Promise Exception (Monitor):\n`,
      err
    );
  });

export const healthCheck = createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("OK");
  response.end();
});
