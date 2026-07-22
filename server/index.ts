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

const clientOrigins = (process.env.CLIENT_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: clientOrigins,
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
  socket.join("lobby");
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

    // 새로고침 등으로 소켓이 새로 연결됐을 때, 이미 참여 중이던 방이 있다면
    // 그 방 채널로 다시 join 시켜서 room 단위 이벤트를 계속 받을 수 있게 한다.
    const existingRoom = rooms.find((room) =>
      room.players.some((player) => player.id === currentPlayerId),
    );

    if (existingRoom) {
      socket.leave("lobby");
      socket.join(existingRoom.id);
      socket.emit("roomUpdated", existingRoom);
    }
  });

  socket.on("createRoom", (room: CreateRoomPayload) => {
    rooms.unshift(room);

    socket.leave("lobby");
    socket.join(room.id);

    io.to("lobby").emit("roomsUpdated", rooms);
    io.to(room.id).emit("roomUpdated", room);
  });

  socket.on(
    "enterRoom",
    ({ roomId, currentPlayerId, nickname }: EnterRoomPayload) => {
      rooms = rooms.map((room) =>
        room.id === roomId
          ? updateEnterRoom(room, currentPlayerId, nickname)
          : room,
      );

      const updatedRoom = rooms.find((room) => room.id === roomId);

      socket.leave("lobby");
      socket.join(roomId);

      io.to("lobby").emit("roomsUpdated", rooms);
      if (updatedRoom) {
        io.to(roomId).emit("roomUpdated", updatedRoom);
      }
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

    const remainingRoom = rooms.find((room) => room.id === roomId);

    socket.leave(roomId);
    socket.join("lobby");

    io.to("lobby").emit("roomsUpdated", rooms);
    if (remainingRoom) {
      io.to(roomId).emit("roomUpdated", remainingRoom);
    }
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

      const updatedRoom = rooms.find((room) => room.id === roomId);

      // 로비 목록에 보이는 문제집 이름도 바뀌므로 로비에도 알려준다.
      io.to("lobby").emit("roomsUpdated", rooms);
      if (updatedRoom) {
        io.to(roomId).emit("roomUpdated", updatedRoom);
      }
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

      const updatedRoom = rooms.find((room) => room.id === roomId);

      // 로비의 입장 버튼이 "게임중"으로 바뀌어야 하므로 로비에도 알려준다.
      io.to("lobby").emit("roomsUpdated", rooms);
      if (updatedRoom) {
        io.to(roomId).emit("roomUpdated", updatedRoom);
      }
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

      const updatedRoom = rooms.find((room) => room.id === roomId);

      // 로비의 입장 버튼이 다시 "입장"으로 바뀌어야 하므로 로비에도 알려준다.
      io.to("lobby").emit("roomsUpdated", rooms);
      if (updatedRoom) {
        io.to(roomId).emit("roomUpdated", updatedRoom);
      }
    },
  );

  socket.on("disconnect", () => {
    const currentPlayerId = socketPlayerIds.get(socket.id);

    if (!currentPlayerId) {
      console.log("연결 종료", socket.id);
      return;
    }

    const affectedRoomIds = rooms
      .filter((room) =>
        room.players.some((player) => player.id === currentPlayerId),
      )
      .map((room) => room.id);

    rooms = rooms
      .map((room) =>
        room.players.some((player) => player.id === currentPlayerId)
          ? updateLeaveRoom(room, currentPlayerId)
          : room,
      )
      .filter((room) => room.players.length > 0);

    socketPlayerIds.delete(socket.id);

    io.to("lobby").emit("roomsUpdated", rooms);

    affectedRoomIds.forEach((roomId) => {
      const updatedRoom = rooms.find((room) => room.id === roomId);
      if (updatedRoom) {
        io.to(roomId).emit("roomUpdated", updatedRoom);
      }
    });

    console.log("연결 종료", socket.id);
  });
});

function subscribeToQuizSetsChanges() {
  supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "quiz_sets" },
      (payload) => {
        console.log("DB에서 문제집 삭제 감지:", payload.old.id);

        // 1. 소켓 서버의 인메모리 데이터 갱신
        sharedQuizSets = sharedQuizSets.filter(
          (quizSet) => quizSet.id !== payload.old.id,
        );

        // 2. 연결된 모든 클라이언트에게 실시간 전파
        io.emit("quizSetsUpdated", sharedQuizSets);
      },
    )

    .subscribe();
}

const port = Number(process.env.PORT ?? 4000);

// DB 로드 후 서버 시작 및 실시간 구독 활성화
loadQuizSets()
  .then(() => {
    subscribeToQuizSetsChanges();
    server.listen(port, () => {
      console.log(`socket server running on ${port}`);
    });
  })
  .catch((err) => {
    console.error("초기 데이터 로드 실패:", err);
  });
