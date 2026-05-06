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
