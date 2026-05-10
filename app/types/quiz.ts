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
  questions: Question[];
};

export type Player = {
  id: string;
  nickname: string;
  isHost: boolean;
  score: number;
  answeredQuestionIndex?: number;
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
  status: "waiting" | "playing";
  currentQuestionIndex: number;
  quizQuestions: Question[];
};

export type ChatMessage = {
  id: string;
  nickname: string;
  message: string;
  createdAt: string;
  playerId: string;
};
