"use client";

import { useEffect, useState } from "react";

import type { Room, ChatMessage, QuizSet } from "../types/quiz";

import { socket } from "../lib/socket/socket";

type UseRoomGameProps = {
  allQuizSets: QuizSet[];
  nickname: string;
  currentPlayerId: string;
};

export function useRoomGame({
  allQuizSets,
  nickname,
  currentPlayerId,
}: UseRoomGameProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [enteredRoomId, setEnteredRoomId] = useState<string | null>(null);

  useEffect(() => {
    socket.on("roomsUpdated", (rooms) => {
      setRooms(rooms);

      const joinedRoom = rooms.find((room: Room) =>
        room.players.some((player) => player.id === currentPlayerId),
      );

      if (joinedRoom) {
        setEnteredRoomId(joinedRoom.id);
      } else {
        setEnteredRoomId(null);
      }
    });

    return () => {
      socket.off("roomsUpdated");
    };
  }, [currentPlayerId]);

  const roomQuizSet = (roomId: string, quizSetId: string) => {
    const selectedQuizSet = allQuizSets.find((quiz) => quiz.id === quizSetId);
    if (!selectedQuizSet) return;

    socket.emit("updateRoomQuizSet", {
      roomId,
      quizSet: selectedQuizSet,
      currentPlayerId,
    });
  };

  const createRoom = (room: Room) => {
    socket.emit("createRoom", room);

    setEnteredRoomId(room.id);
  };

  const enterRoom = (roomId: string) => {
    socket.emit("enterRoom", {
      roomId,
      currentPlayerId,
      nickname,
    });
  };

  const leaveRoom = () => {
    if (!enteredRoomId) return;

    socket.emit("leaveRoom", {
      roomId: enteredRoomId,
      currentPlayerId,
    });
  };

  const enteredRoom = rooms.find((room) => room.id === enteredRoomId);

  const sendRoomMessage = (roomId: string, message: ChatMessage) => {
    socket.emit("sendRoomMessage", { roomId, message });
  };

  const startRoomGame = (roomId: string) => {
    socket.emit("startRoomGame", { roomId, currentPlayerId });
  };

  const submitRoomAnswer = (
    roomId: string,
    playerId: string,
    choiceIndex: number,
    timeLeft: number,
  ) => {
    socket.emit("submitRoomAnswer", {
      roomId,
      playerId,
      choiceIndex,
      timeLeft,
    });
  };

  const timeOver = (roomId: string) => {
    socket.emit("timeOver", { roomId });
  };

  const countdownEnd = (roomId: string) => {
    socket.emit("countdownEnd", { roomId });
  };

  const restartRoomGame = (roomId: string) => {
    socket.emit("restartRoomGame", { roomId, currentPlayerId });
  };

  const nextQuestion = (roomId: string) => {
    socket.emit("nextQuestion", { roomId });
  };

  return {
    rooms,
    enteredRoomId,
    enteredRoom,

    createRoom,
    enterRoom,
    leaveRoom,

    roomQuizSet,
    sendRoomMessage,

    startRoomGame,
    submitRoomAnswer,

    timeOver,
    countdownEnd,

    restartRoomGame,
    nextQuestion,
  };
}
