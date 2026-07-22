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
  const [enteredRoom, setEnteredRoom] = useState<Room | null>(null);

  useEffect(() => {
    // 로비(방 목록)를 보고 있을 때 필요한 목록 전체 갱신
    socket.on("roomsUpdated", (rooms: Room[]) => {
      setRooms(rooms);
    });

    // 내가 들어가 있는 방 하나의 상태 갱신 (서버가 해당 방 채널로만 보내줌)
    socket.on("roomUpdated", (room: Room) => {
      setEnteredRoom(room);
      setEnteredRoomId(room.id);
    });

    return () => {
      socket.off("roomsUpdated");
      socket.off("roomUpdated");
    };
  }, []);

  useEffect(() => {
    if (!currentPlayerId) return;

    socket.emit("registerPlayer", {
      currentPlayerId,
    });
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

  const [isGeneratingAiQuestions, setIsGeneratingAiQuestions] = useState(false);
  const [aiQuizError, setAiQuizError] = useState("");

  const generateAiRoomQuizSet = async (
    roomId: string,
    topic: string,
    category: string,
    count: number,
  ) => {
    setIsGeneratingAiQuestions(true);
    setAiQuizError("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "AI 퀴즈 생성에 실패했습니다.");
      }

      const aiQuizSet: QuizSet = {
        id: `ai-${crypto.randomUUID()}`,
        title: `AI: ${topic}`,
        category: category || "AI 생성",
        author: "AI",
        authorId: currentPlayerId,
        questions: data.questions,
      };

      socket.emit("updateRoomQuizSet", {
        roomId,
        quizSet: aiQuizSet,
        currentPlayerId,
      });
    } catch (error) {
      setAiQuizError(
        error instanceof Error ? error.message : "AI 퀴즈 생성에 실패했습니다.",
      );
    } finally {
      setIsGeneratingAiQuestions(false);
    }
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

    setEnteredRoomId(null);
    setEnteredRoom(null);
  };

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

    generateAiRoomQuizSet,
    isGeneratingAiQuestions,
    aiQuizError,
  };
}
