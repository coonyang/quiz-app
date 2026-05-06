type Question = {
  id: number;
  category: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

type ResultScreen = {
  quizQuestions: Question[];
  answers: number[];
  score: number;
  startQuiz: () => void;
  startTime: number | null;
  finishTime: number | null;
};

export default function ResultScreen({
  quizQuestions,
  answers,
  score,
  startQuiz,
  startTime,
  finishTime,
}: ResultScreen) {
  const elapsedSeconds =
    startTime && finishTime ? Math.floor((finishTime - startTime) / 1000) : 0;

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6 text-center">
      <h2 className="text-3xl font-bold">결과</h2>
      <p className="text-lg">
        {quizQuestions.length}문제 중 {score}개 맞혔습니다.
      </p>
      <p className="text-lg">걸린 시간: {elapsedSeconds}초</p>

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
    </section>
  );
}
