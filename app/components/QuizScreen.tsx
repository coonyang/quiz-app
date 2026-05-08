import type { Question } from "../types/quiz";

type QuizScreenProps = {
  currentIndex: number;
  quizQuestions: Question[];
  currentQuestion: Question;
  isAnswerChecked: boolean;
  selectedChoice: number | null;
  onSelectChoice: (choiceIndex: number) => void;
  timeLeft: number;
};

export default function QuizScreen({
  currentIndex,
  quizQuestions,
  currentQuestion,
  isAnswerChecked,
  selectedChoice,
  onSelectChoice,
  timeLeft,
}: QuizScreenProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <p className="text-sm">
        {currentIndex + 1} / {quizQuestions.length}
      </p>
      <p className="text-sm">남은 시간: {timeLeft}초</p>
      <h2 className="text-2xl font-bold leading-relaxed">
        {currentQuestion.question}
      </h2>
      <div className="grid gap-3">
        {currentQuestion.choices.map((choice, index) => {
          const isCorrect = index === currentQuestion.answerIndex;
          const isSelected = selectedChoice === index;

          let choiceClass = "rounded-lg border px-5 py-4 hover:bg-emerald-300";

          if (isAnswerChecked && isCorrect) {
            choiceClass = "rounded-lg border px-5 py-4 bg-emerald-300";
          }
          if (isAnswerChecked && isSelected && !isCorrect) {
            choiceClass = "rounded-lg border px-5 py-4 bg-red-300";
          }
          return (
            <button
              className={choiceClass}
              key={`${choice}-${index}`}
              onClick={() => onSelectChoice(index)}
              disabled={isAnswerChecked}
            >
              {choice}
            </button>
          );
        })}
      </div>{" "}
    </section>
  );
}
