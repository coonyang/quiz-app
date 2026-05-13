import type { Room } from "@/app/types/quiz";

export function updateNextQuestion(room: Room): Room {
  return {
    ...room,
    status: "playing",
    currentQuestionIndex: room.currentQuestionIndex + 1,
  };
}
