import { createServer } from "node:http";
import express from "@/express";

const server = createServer(express);

server.listen(8000, () => {
  console.log("server running at http://localhost:8000");
});

export default server;
