"use client";

import { questions } from "./data/questions";
import { useState } from "react";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const startQuiz = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    setQuizQuestions(selected);
    setCurrentIndex(0);
    setIsStarted(true);
  };

  const currentQuestion = quizQuestions[currentIndex];

  const selectChoice = (choiceIndex: number) => {
    const answer = currentQuestion.answerIndex;
    if (choiceIndex == answer) {
      alert("정답입니다.");
      if (currentIndex < quizQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        alert("문제 끝!!");
        setIsStarted(false);
      }
    } else {
      alert("땡!!");
    }
  };

  return (
    <main>
      {!isStarted && <button onClick={startQuiz}>시작하기</button>}

      {isStarted && currentQuestion && (
        <section>
          <p>
            {currentIndex + 1} / {quizQuestions.length}
          </p>

          <h2>{currentQuestion.question}</h2>

          {currentQuestion.choices.map((choice, index) => (
            <button onClick={() => selectChoice(index)}>
              {index + 1}. {choice}
            </button>
          ))}
        </section>
      )}
    </main>
  );
}
