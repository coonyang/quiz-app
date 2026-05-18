import type { Room } from "@/app/types/quiz";

export function updateTimeOver(room: Room): Room {
  if (room.status !== "playing") {
    return room;
  }

  const updatedPlayers = room.players.map((player) => {
    if (player.answeredQuestionIndex === room.currentQuestionIndex) {
      return player;
    }

    return {
      ...player,
      answeredQuestionIndex: room.currentQuestionIndex,
      isLastAnswerCorrect: false,
    };
  });

  const isLastQuestion =
    room.currentQuestionIndex >= room.quizQuestions.length - 1;

  if (isLastQuestion) {
    return {
      ...room,
      players: updatedPlayers,
      status: "finished",
    };
  }

  return {
    ...room,
    players: updatedPlayers,
    status: "result",
  };
}
