import express from "express";
import http from "http";

import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("유저 연결", socket.id);

  socket.on("disconnect", () => {
    console.log("연결 종료", socket.id);
  });
});

server.listen(4000, () => {
  console.log("socket server running");
});
