import type { Room } from "../../types/quiz";

export function updateRoomAfterTimeOver(room: Room): Room {
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
    players: updatedPlayers.map((player) => ({
      ...player,
      answeredQuestionIndex: undefined,
    })),
    currentQuestionIndex: room.currentQuestionIndex + 1,
    questionStartedAt: Date.now(),
  };
}
