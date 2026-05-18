import express from "express";
import http from "http";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
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
import type { Room, QuizSet } from "../app/types/quiz";
import type {
  EnterRoomPayload,
  SendRoomMessagePayload,
  UpdateRoomQuizSetPayload,
  SubmitRoomAnswerPayload,
  PlayerRoomPayload,
  RoomIdPayload,
  CreateRoomPayload,
  RegisterPlayerPayload,
  CreateQuizSetPayload,
  UpdateQuizSetPayload,
  DeleteQuizSetPayload,
} from "../app/types/socket";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const socketPlayerIds = new Map<string, string>();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

let rooms: Room[] = [];
let sharedQuizSets: QuizSet[] = [];

async function loadQuizSets() {
  const { data, error } = await supabase
    .from("quiz_sets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  sharedQuizSets = data.map((quizSet) => ({
    id: quizSet.id,
    title: quizSet.title,
    category: quizSet.category,
    author: quizSet.author,
    authorId: quizSet.author_id,
    questions: quizSet.questions,
  }));
}

io.on("connection", (socket) => {
  console.log("유저 연결", socket.id);
  socket.emit("roomsUpdated", rooms);
  socket.emit("quizSetsUpdated", sharedQuizSets);

  socket.on("createQuizSet", async ({ quizSet }: CreateQuizSetPayload) => {
    const { error } = await supabase.from("quiz_sets").insert({
      id: quizSet.id,
      title: quizSet.title,
      category: quizSet.category,
      author: quizSet.author,
      author_id: quizSet.authorId,
      questions: quizSet.questions,
    });

    if (error) {
      console.error(error);
      return;
    }

    sharedQuizSets = [quizSet, ...sharedQuizSets];

    io.emit("quizSetsUpdated", sharedQuizSets);
  });

  socket.on(
    "updateQuizSet",
    async ({ quizSet, currentPlayerId }: UpdateQuizSetPayload) => {
      const targetQuizSet = sharedQuizSets.find(
        (item) => item.id === quizSet.id,
      );

      if (targetQuizSet?.authorId !== currentPlayerId) {
        return;
      }
      const { error } = await supabase
        .from("quiz_sets")
        .update({
          title: quizSet.title,
          category: quizSet.category,
          author: quizSet.author,
          author_id: quizSet.authorId,
          questions: quizSet.questions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quizSet.id);

      if (error) {
        console.error(error);
        return;
      }

      sharedQuizSets = sharedQuizSets.map((item) =>
        item.id === quizSet.id ? quizSet : item,
      );

      io.emit("quizSetsUpdated", sharedQuizSets);
    },
  );

  socket.on(
    "deleteQuizSet",
    async ({ quizSetId, currentPlayerId }: DeleteQuizSetPayload) => {
      const targetQuizSet = sharedQuizSets.find(
        (quizSet) => quizSet.id === quizSetId,
      );

      if (targetQuizSet?.authorId !== currentPlayerId) {
        return;
      }
      const { error } = await supabase
        .from("quiz_sets")
        .delete()
        .eq("id", quizSetId);

      if (error) {
        console.error(error);
        return;
      }

      sharedQuizSets = sharedQuizSets.filter(
        (quizSet) => quizSet.id !== quizSetId,
      );

      io.emit("quizSetsUpdated", sharedQuizSets);
    },
  );

  socket.on("registerPlayer", ({ currentPlayerId }: RegisterPlayerPayload) => {
    socketPlayerIds.set(socket.id, currentPlayerId);
  });

  socket.on("createRoom", (room: CreateRoomPayload) => {
    rooms.unshift(room);

    console.log("emit 직전", rooms);
    io.emit("roomsUpdated", rooms);
  });

  socket.on(
    "enterRoom",
    ({ roomId, currentPlayerId, nickname }: EnterRoomPayload) => {
      rooms = rooms.map((room) =>
        room.id === roomId
          ? updateEnterRoom(room, currentPlayerId, nickname)
          : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on(
    "sendRoomMessage",
    ({ roomId, message }: SendRoomMessagePayload) => {
      rooms = rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              messages: [...room.messages, message],
            }
          : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on("leaveRoom", ({ roomId, currentPlayerId }: PlayerRoomPayload) => {
    rooms = rooms
      .map((room) =>
        room.id === roomId ? updateLeaveRoom(room, currentPlayerId) : room,
      )
      .filter((room) => room.players.length > 0);

    io.emit("roomsUpdated", rooms);
  });

  socket.on(
    "updateRoomQuizSet",
    ({ roomId, quizSet, currentPlayerId }: UpdateRoomQuizSetPayload) => {
      const room = rooms.find((room) => room.id === roomId);

      const isHost = room?.players.some(
        (player) => player.id === currentPlayerId && player.isHost,
      );

      if (!isHost) return;

      rooms = rooms.map((room) =>
        room.id === roomId ? updateRoomQuizSet(room, quizSet) : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on(
    "startRoomGame",
    ({ roomId, currentPlayerId }: PlayerRoomPayload) => {
      const room = rooms.find((room) => room.id === roomId);

      const isHost = room?.players.some(
        (player) => player.id === currentPlayerId && player.isHost,
      );

      if (!isHost) return;

      rooms = rooms.map((room) =>
        room.id === roomId ? updateStartRoomGame(room) : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on(
    "submitRoomAnswer",
    ({ roomId, playerId, choiceIndex, timeLeft }: SubmitRoomAnswerPayload) => {
      rooms = rooms.map((room) =>
        room.id === roomId
          ? updateSubmitRoomAnswer(room, playerId, choiceIndex, timeLeft)
          : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on("timeOver", ({ roomId }: RoomIdPayload) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateTimeOver(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("countdownEnd", ({ roomId }: RoomIdPayload) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateCountdownEnd(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on("nextQuestion", ({ roomId }: RoomIdPayload) => {
    rooms = rooms.map((room) =>
      room.id === roomId ? updateNextQuestion(room) : room,
    );

    io.emit("roomsUpdated", rooms);
  });

  socket.on(
    "restartRoomGame",
    ({ roomId, currentPlayerId }: PlayerRoomPayload) => {
      const room = rooms.find((room) => room.id === roomId);
      const isHost = room?.players.some(
        (player) => player.id === currentPlayerId && player.isHost,
      );

      if (!isHost) return;

      rooms = rooms.map((room) =>
        room.id === roomId ? updateRestartRoomGame(room) : room,
      );

      io.emit("roomsUpdated", rooms);
    },
  );

  socket.on("disconnect", () => {
    const currentPlayerId = socketPlayerIds.get(socket.id);

    if (!currentPlayerId) {
      console.log("연결 종료", socket.id);
      return;
    }

    rooms = rooms
      .map((room) =>
        room.players.some((player) => player.id === currentPlayerId)
          ? updateLeaveRoom(room, currentPlayerId)
          : room,
      )
      .filter((room) => room.players.length > 0);

    socketPlayerIds.delete(socket.id);

    io.emit("roomsUpdated", rooms);

    console.log("연결 종료", socket.id);
  });
});
loadQuizSets().then(() => {
  server.listen(4000, () => {
    console.log("socket server running");
  });
});
