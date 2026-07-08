import type { Question } from "../types/quiz";

const TIME_LIMIT = 30;

type QuizScreenProps = {
  currentIndex: number;
  quizQuestions: Question[];
  currentQuestion: Question;
  isAnswerChecked: boolean;
  selectedChoice: number | null;
  onSelectChoice: (choiceIndex: number) => void;
  timeLeft: number;
  goHome: () => void;
};

export default function QuizScreen({
  currentIndex,
  quizQuestions,
  currentQuestion,
  isAnswerChecked,
  selectedChoice,
  onSelectChoice,
  timeLeft,
  goHome,
}: QuizScreenProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="badge bg-slate-100 text-slate-600">
          {currentIndex + 1} / {quizQuestions.length}
        </span>

        <button
          onClick={goHome}
          className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
        >
          나가기
        </button>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full transition-all ${
            timeLeft <= 5 ? "bg-red-400" : "bg-emerald-500"
          }`}
          style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
        />
      </div>
      <p className="text-sm text-slate-500">남은 시간: {timeLeft}초</p>

      <div className="card">
        <h2 className="text-2xl font-bold leading-relaxed text-slate-900">
          {currentQuestion.question}
        </h2>
      </div>

      <div className="grid gap-3">
        {currentQuestion.choices.map((choice, index) => {
          const isCorrect = index === currentQuestion.answerIndex;
          const isSelected = selectedChoice === index;

          let choiceClass =
            "rounded-xl border border-slate-200 bg-white px-5 py-4 text-left font-medium text-slate-900 transition-colors hover:border-emerald-300 hover:bg-emerald-50";

          if (isAnswerChecked && isCorrect) {
            choiceClass =
              "rounded-xl border border-emerald-500 bg-emerald-500 px-5 py-4 text-left font-medium text-white";
          }
          if (isAnswerChecked && isSelected && !isCorrect) {
            choiceClass =
              "rounded-xl border border-red-400 bg-red-400 px-5 py-4 text-left font-medium text-white";
          }
          return (
            <button
              className={choiceClass}
              key={`${choice}-${index}`}
              onClick={() => onSelectChoice(index)}
              disabled={isAnswerChecked}
            >
              <span className="mr-2 font-bold opacity-70">{index + 1}.</span>
              {choice}
            </button>
          );
        })}
      </div>
    </section>
  );
}
