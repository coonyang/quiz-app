import type { Room } from "../../types/quiz";

export function handleSubmitRoomAnswer(
  room: Room,
  playerId: string,
  choiceIndex: number,
  timeLeft: number,
): Room {
  const currentQuestion = room.quizQuestions[room.currentQuestionIndex];

  const isCorrect = choiceIndex === currentQuestion.answerIndex;

  const updatedPlayers = room.players.map((player) => {
    if (player.id !== playerId) {
      return player;
    }

    if (player.answeredQuestionIndex === room.currentQuestionIndex) {
      return player;
    }

    return {
      ...player,
      score: isCorrect ? player.score + 100 + timeLeft : player.score,
      answeredQuestionIndex: room.currentQuestionIndex,
    };
  });

  const allAnswered = updatedPlayers.every(
    (player) => player.answeredQuestionIndex === room.currentQuestionIndex,
  );

  const isLastQuestion =
    room.currentQuestionIndex >= room.quizQuestions.length - 1;

  if (allAnswered && isLastQuestion) {
    return {
      ...room,
      players: updatedPlayers,
      status: "finished",
    };
  }

  if (allAnswered) {
    return {
      ...room,
      questionStartedAt: Date.now(),
      players: updatedPlayers.map((player) => ({
        ...player,
        answeredQuestionIndex: undefined,
      })),
      status: "result",
    };
  }

  return {
    ...room,
    players: updatedPlayers,
  };
}
