"use client";

import { questions } from "./data/questions";
import { useState } from "react";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const categories = ["전체", "수학", "개발용어"];

  const startQuiz = () => {
    const filteredQuestions =
      selectedCategory === "전체"
        ? questions
        : questions.filter((item) => item.category === selectedCategory);

    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    setQuizQuestions(selected);
    setCurrentIndex(0);
    setIsStarted(true);
    setScore(0);
    setIsFinished(false);
    setAnswers([]);
  };

  const currentQuestion = quizQuestions[currentIndex];

  const selectChoice = (choiceIndex: number) => {
    if (isAnswerChecked) return;

    const answer = currentQuestion.answerIndex;

    setSelectedChoice(choiceIndex);
    setIsAnswerChecked(true);
    setAnswers((prev) => [...prev, choiceIndex]);

    if (choiceIndex === answer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < quizQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setIsAnswerChecked(false);
      } else {
        setIsStarted(false);
        setIsFinished(true);
        setSelectedChoice(null);
        setIsAnswerChecked(false);
      }
    }, 500);
  };

  return (
    <main className="min-h-screen px-4 py-4 ">
      {!isStarted && !isFinished && (
        <section className="mx-auto flex max-w-xl flex-col gap-6">
          <h1 className="mt-2 text-3xl font-bold">퀴즈 목록</h1>
          <div className="rounded-lg border p-5">
            <h2 className="mb-3 text-lg font-semibold">카테고리 선택</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-md border px-4 py-2 ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>{" "}
            <p className="mt-2">선택한 카테고리 : {selectedCategory}</p>
          </div>

          <button
            className="rounded-md border px-5 py-3 hover:bg-emerald-300"
            onClick={startQuiz}
          >
            시작하기
          </button>
        </section>
      )}

      {isStarted && currentQuestion && (
        <section className="mx-auto flex max-w-xl flex-col gap-6">
          <p className="text-sm">
            {currentIndex + 1} / {quizQuestions.length}
          </p>
          <h2 className="text-2xl font-bold leading-relaxed">
            {currentQuestion.question}
          </h2>
          <div className="grid gap-3">
            {currentQuestion.choices.map((choice, index) => {
              const isCorrect = index === currentQuestion.answerIndex;
              const isSelected = selectedChoice === index;

              let choiceClass =
                "rounded-lg border px-5 py-4 hover:bg-emerald-300";

              if (isAnswerChecked && isCorrect) {
                choiceClass = "rounded-lg border px-5 py-4 bg-emerald-300";
              }
              if (isAnswerChecked && isSelected && !isCorrect) {
                choiceClass = "rounded-lg border px-5 py-4 bg-red-300";
              }
              return (
                <button
                  className={choiceClass}
                  key={choice}
                  onClick={() => selectChoice(index)}
                  disabled={isAnswerChecked}
                >
                  {choice}
                </button>
              );
            })}
          </div>{" "}
        </section>
      )}
      {isFinished && (
        <section className="mx-auto flex max-w-xl flex-col gap-6 text-center">
          <h2 className="text-3xl font-bold">결과</h2>
          <p className="text-lg">
            {quizQuestions.length}문제 중 {score}개 맞혔습니다.
          </p>
          {quizQuestions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.answerIndex;
            return (
              <div
                key={question.id}
                className="rounded-lg border p-4 text-left"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">{question.question} </p>

                  <p
                    className={isCorrect ? "text-emerald-600" : "text-red-600"}
                  >
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
      )}
    </main>
  );
}
