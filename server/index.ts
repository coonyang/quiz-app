import express from "express";
import http from "http";

import { Server } from "socket.io";
import {
  updateCountdownEnd,
  updateEnterRoom,
  updateLeaveRoom,
  updateNextQuestion,
  updateRestartRoomGame,
  updateRoomQuizSet,
  updateStartRoomGame,
  updateSubmitRoomAnswer,
  updateTimeOver,
} from "../app/lib/room";
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
  socket.emit("roomsUpdated", rooms);

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

  socket.on("sendRoomMessage", ({ roomId, message }) => {
    rooms = rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            messages: [...room.messages, message],
          }
        : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("leaveRoom", ({ roomId, currentPlayerId }) => {
    rooms = rooms
      .map((room) =>
        room.id === roomId ? updateLeaveRoom(room, currentPlayerId) : room,
      )
      .filter((room) => room.players.length > 0);

    io.emit("roomsUpdated", rooms);
  });

  socket.on("updateRoomQuizSet", ({ roomId, quizSet }) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateRoomQuizSet(room, quizSet) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("startRoomGame", ({ roomId }) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateStartRoomGame(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on(
    "submitRoomAnswer",
    ({ roomId, playerId, choiceIndex, timeLeft }) => {
      rooms = rooms.map((room) =>
        room.id === roomId
          ? updateSubmitRoomAnswer(room, playerId, choiceIndex, timeLeft)
          : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on("timeOver", ({ roomId }) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateTimeOver(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("countdownEnd", ({ roomId }) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateCountdownEnd(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("nextQuestion", ({ roomId }) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateNextQuestion(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("restartRoomGame", ({ roomId }) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateRestartRoomGame(room) : room,
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
