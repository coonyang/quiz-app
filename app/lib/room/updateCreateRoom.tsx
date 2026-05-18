import type { Room, QuizSet } from "../../types/quiz";

export function updateCreateRoom(
  title: string,
  selectedQuizSet: QuizSet,
  nickname: string,
  currentPlayerId: string,
  maxPlayers: number,
): Room {
  const hostNickname = nickname.trim() || "익명";

  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    quizSetId: selectedQuizSet.id,
    quizSetTitle: selectedQuizSet.title,
    hostNickname,

    players: [
      {
        id: currentPlayerId,
        nickname: hostNickname,
        isHost: true,
        score: 0,
      },
    ],

    maxPlayers,

    messages: [
      {
        id: crypto.randomUUID(),
        playerId: "system",
        nickname: "시스템",
        message: `${hostNickname}님이 방을 만들었습니다.`,
        createdAt: new Date().toISOString(),
      },
    ],

    status: "waiting",
    currentQuestionIndex: 0,
    quizQuestions: [...selectedQuizSet.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10),
    questionStartedAt: null,
    timeLimit: 30,
  };
}
