import type { Room } from "@/app/types/quiz";

export function updateRoomAfterNextQuestion(room: Room): Room {
  return {
    ...room,
    status: "playing",
    currentQuestionIndex: room.currentQuestionIndex + 1,
  };
}
