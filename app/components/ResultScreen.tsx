import type { Question, RankingRecord } from "../types/quiz";

type ResultScreenProps = {
  quizQuestions: Question[];
  score: number;
  answers: number[];
  startQuiz: () => void;
  startTime: number | null;
  finishTime: number | null;
  correctCount: number;
  rankings: RankingRecord[];
  selectedQuizSetId: string;
  onGoHome: () => void;
};

export default function ResultScreen({
  quizQuestions,
  answers,
  score,
  startQuiz,
  startTime,
  finishTime,
  correctCount,
  rankings,
  selectedQuizSetId,
  onGoHome,
}: ResultScreenProps) {
  const elapsedSeconds =
    startTime && finishTime ? Math.floor((finishTime - startTime) / 1000) : 0;
  const visibleRankings = rankings.filter(
    (ranking) => ranking.quizSetId === selectedQuizSetId,
  );

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 text-center">
      <h2 className="text-3xl font-bold">결과</h2>
      <p className="text-lg">
        {quizQuestions.length}문제 중 {correctCount}개 맞혔습니다.
      </p>
      <p className="text-lg">걸린 시간: {elapsedSeconds}초</p>
      <p>총점: {score}점</p>
      {quizQuestions.map((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.answerIndex;
        return (
          <div key={question.id} className="rounded-lg border p-4 text-left">
            <div className="flex justify-between">
              <p className="font-semibold">{question.question} </p>

              <p className={isCorrect ? "text-emerald-600" : "text-red-600"}>
                {isCorrect ? "정답" : "오답"}
              </p>
            </div>
            <p>선택: {question.choices[userAnswer]}</p>
            <p>정답: {question.choices[question.answerIndex]}</p>
          </div>
        );
      })}
      <button
        className="rounded-md border px-5 py-3 font-semibold hover:bg-emerald-300"
        onClick={startQuiz}
      >
        다시 시작하기
      </button>
      <button
        className="rounded-md border px-5 py-3 font-semibold hover:bg-emerald-300"
        onClick={onGoHome}
      >
        홈으로 돌아가기
      </button>
      <h3 className="text-2xl font-bold">랭킹</h3>

      {visibleRankings.map((ranking, index) => (
        <div key={ranking.id} className="rounded-lg border p-4 text-left">
          <p>
            {index + 1}. {ranking.nickname}
          </p>
          <p>점수: {ranking.score}점</p>
          <p>
            정답: {ranking.correctCount} / {ranking.totalQuestions}
          </p>
          <p>시간: {ranking.elapsedSeconds}초</p>
        </div>
      ))}
      {visibleRankings.length === 0 && (
        <p className="text-sm text-gray-500">아직 랭킹이 없습니다.</p>
      )}
    </section>
  );
}
