"use client";

import { useEffect, useState } from "react";

import type { Room, ChatMessage, QuizSet } from "../types/quiz";

import {
  updateCountdownEnd,
  updateLeaveRoom,
  updateNextQuestion,
  updateRestartRoomGame,
  updateStartRoomGame,
  updateSubmitRoomAnswer,
  updateTimeOver,
  updateRoomQuizSet,
} from "../lib/room";
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

    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? updateRoomQuizSet(room, selectedQuizSet) : room,
      ),
    );
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

    setRooms((prev) =>
      prev
        .map((room) =>
          room.id === enteredRoomId
            ? updateLeaveRoom(room, currentPlayerId)
            : room,
        )
        .filter((room) => room.players.length > 0),
    );

    setEnteredRoomId(null);
  };

  const enteredRoom = rooms.find((room) => room.id === enteredRoomId);

  const sendRoomMessage = (roomId: string, message: ChatMessage) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              messages: [...room.messages, message],
            }
          : room,
      ),
    );
  };

  const startRoomGame = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? updateStartRoomGame(room) : room,
      ),
    );
  };

  const submitRoomAnswer = (
    roomId: string,
    playerId: string,
    choiceIndex: number,
    timeLeft: number,
  ) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? updateSubmitRoomAnswer(room, playerId, choiceIndex, timeLeft)
          : room,
      ),
    );
  };

  const timeOver = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? updateTimeOver(room) : room)),
    );
  };

  const countdownEnd = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? updateCountdownEnd(room) : room,
      ),
    );
  };

  const restartRoomGame = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? updateRestartRoomGame(room) : room,
      ),
    );
  };

  const nextQuestion = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? updateNextQuestion(room) : room,
      ),
    );
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
