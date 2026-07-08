import type { Question } from "../types/quiz";

type ResultScreenProps = {
  quizQuestions: Question[];
  score: number;
  answers: number[];
  startQuiz: () => void;
  startTime: number | null;
  finishTime: number | null;
  correctCount: number;
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
  onGoHome,
}: ResultScreenProps) {
  const elapsedSeconds =
    startTime && finishTime ? Math.floor((finishTime - startTime) / 1000) : 0;

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="card text-center">
        <h2 className="text-3xl font-bold text-slate-900">결과</h2>
        <p className="mt-2 text-lg text-slate-700">
          {quizQuestions.length}문제 중{" "}
          <span className="font-semibold text-emerald-600">
            {correctCount}개
          </span>{" "}
          맞혔습니다
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500">
          <p>걸린 시간: {elapsedSeconds}초</p>
          <p>총점: {score}점</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {quizQuestions.map((question, index) => {
          const userAnswer = answers[index];
          const isCorrect = userAnswer === question.answerIndex;

          return (
            <div key={question.id} className="card text-left">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900">
                  {question.question}
                </p>

                <span
                  className={`badge shrink-0 ${
                    isCorrect
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {isCorrect ? "정답" : "오답"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                선택: {question.choices[userAnswer] ?? "-"}
              </p>
              <p className="text-sm text-slate-500">
                정답: {question.choices[question.answerIndex]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button className="btn-outline flex-1 py-3" onClick={onGoHome}>
          홈으로 돌아가기
        </button>
        <button className="btn-primary flex-1 py-3" onClick={startQuiz}>
          다시 시작하기
        </button>
      </div>
    </section>
  );
}
