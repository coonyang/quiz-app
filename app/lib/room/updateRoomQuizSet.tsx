import type { Room, QuizSet } from "@/app/types/quiz";

export function updateRoomQuizSet(room: Room, selectedQuizSet: QuizSet): Room {
  if (room.status !== "waiting") return room;
  return {
    ...room,
    quizSetId: selectedQuizSet.id,
    quizSetTitle: selectedQuizSet.title,
    quizQuestions: selectedQuizSet.questions,
  };
}
