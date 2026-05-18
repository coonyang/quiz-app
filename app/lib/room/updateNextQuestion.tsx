import type { Room } from "@/app/types/quiz";

export function updateNextQuestion(room: Room): Room {
  if (room.status !== "result") {
    return room;
  }

  return {
    ...room,
    status: "playing",
    currentQuestionIndex: room.currentQuestionIndex + 1,
  };
}
