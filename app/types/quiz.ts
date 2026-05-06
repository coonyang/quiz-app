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
