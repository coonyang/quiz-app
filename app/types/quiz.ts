// 랭킹 타입

export type RankingRecord = {
  id: string;
  nickname: string;
  quizSetId: string;
  quizSetTitle: string;
  category: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  elapsedSeconds: number;
  createdAt: string;
};

// 퀴즈 타입

export type Question = {
  id: number;
  question: string;
  choices: string[];
  answerIndex: number;
};

export type QuizSet = {
  id: string;
  title: string;
  category: string;
  author: string;
  authorId: string;
  questions: Question[];
};

// 온라인 방 타입

export type Player = {
  id: string;
  nickname: string;
  isHost: boolean;
  score: number;
  answeredQuestionIndex?: number | undefined;
};

export type Room = {
  id: string;
  title: string;
  quizSetId: string;
  quizSetTitle: string;
  hostNickname: string;
  players: Player[];
  maxPlayers: number;
  messages: ChatMessage[];
  status: "waiting" | "playing" | "finished" | "countdown" | "result";
  currentQuestionIndex: number;
  quizQuestions: Question[];
  questionStartedAt: number | null;
  timeLimit: number;
};

export type ChatMessage = {
  id: string;
  nickname: string;
  message: string;
  createdAt: string;
  playerId: string;
};
