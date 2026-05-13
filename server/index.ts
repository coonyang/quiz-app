import express from "express";
import http from "http";

import { Server } from "socket.io";
import { updateEnterRoom } from "../app/lib/room";
import type { Room } from "../app/types/quiz";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let rooms: Room[] = [];

io.on("connection", (socket) => {
  console.log("유저 연결", socket.id);

  socket.on("createRoom", (room) => {
    rooms.unshift(room);

    console.log("emit 직전", rooms);
    io.emit("roomsUpdated", rooms);
  });

  socket.on("enterRoom", ({ roomId, currentPlayerId, nickname }) => {
    rooms = rooms.map((room) =>
      room.id === roomId
        ? updateEnterRoom(room, currentPlayerId, nickname)
        : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("disconnect", () => {
    console.log("연결 종료", socket.id);
  });
});
server.listen(4000, () => {
  console.log("socket server running");
});
