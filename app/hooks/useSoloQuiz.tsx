"use client";

import { useEffect, useState } from "react";

import type { Question, QuizSet } from "../types/quiz";

type UseSoloQuizProps = {
  selectedQuizSet: QuizSet | undefined;
};

export function useSoloQuiz({ selectedQuizSet }: UseSoloQuizProps) {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const currentQuestion = quizQuestions[currentIndex];

  const startQuiz = () => {
    if (!selectedQuizSet) return;
    const shuffledQuestions = [...selectedQuizSet.questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    setQuizQuestions(shuffledQuestions);

    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedChoice(null);
    setIsAnswerChecked(false);
    setIsQuizFinished(false);
    setCorrectCount(0);
    setStartTime(Date.now());
    setFinishTime(null);
    setTimeLeft(30);
  };

  const selectChoice = (choiceIndex: number) => {
    if (!currentQuestion) return;
    if (isAnswerChecked) return;

    setSelectedChoice(choiceIndex);
    setIsAnswerChecked(true);

    const isCorrect = choiceIndex === currentQuestion.answerIndex;
    const nextAnswers = [...answers, choiceIndex];

    setAnswers(nextAnswers);

    if (isCorrect) {
      setScore((prev) => prev + 100 + timeLeft);
      setCorrectCount((prev) => prev + 1);
    }

    setTimeout(() => {
      const isLastQuestion = currentIndex >= quizQuestions.length - 1;

      if (isLastQuestion) {
        setFinishTime(Date.now());
        setIsQuizFinished(true);
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsAnswerChecked(false);
      setTimeLeft(30);
    }, 1000);
  };

  useEffect(() => {
    if (isQuizFinished) return;
    if (!startTime) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          selectChoice(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isQuizFinished, startTime]);

  const goHome = () => {
    setQuizQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedChoice(null);
    setIsAnswerChecked(false);
    setIsQuizFinished(false);
    setCorrectCount(0);
    setStartTime(null);
    setFinishTime(null);
    setTimeLeft(30);
  };

  return {
    quizQuestions,
    currentQuestion,
    currentIndex,
    score,
    answers,
    selectedChoice,
    isAnswerChecked,
    isQuizFinished,
    correctCount,
    startTime,
    finishTime,
    timeLeft,
    startQuiz,
    selectChoice,
    goHome,
  };
}
