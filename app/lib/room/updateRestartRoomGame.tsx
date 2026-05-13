import type { Room } from "@/app/types/quiz";

export function updateRestartRoomGame(room: Room): Room {
  return {
    ...room,
    status: "waiting",
    currentQuestionIndex: 0,
    questionStartedAt: null,

    players: room.players.map((player) => ({
      ...player,
      score: 0,
      answeredQuestionIndex: undefined,
    })),
  };
}
