"use client";

import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import StartScreen from "./components/StartScreen";
import { quizSets } from "./data/quizSets";
import { useState, useEffect } from "react";
import type { RankingRecord, Question, QuizSet } from "./types/quiz";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedQuizSetId, setSelectedQuizSetId] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [nickname, setNickname] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const TIME_LIMIT = 30;
  const [rankings, setRankings] = useState<RankingRecord[]>([]);

  const categories = [
    "전체",
    ...new Set(quizSets.map((item) => item.category)),
  ];

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");

    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);
  useEffect(() => {
    if (!isStarted || isAnswerChecked) return;

    if (timeLeft <= 0) {
      selectChoice(-1);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isStarted, isAnswerChecked, timeLeft]);
  useEffect(() => {
    const savedRankings = localStorage.getItem("rankings");

    if (savedRankings) {
      setRankings(JSON.parse(savedRankings));
    }
  }, []);
  useEffect(() => {
    if (!isFinished || !finishTime || !startTime) return;

    saveRanking(finishTime);
  }, [isFinished, finishTime]);

  const visibleQuizSets =
    selectedCategory === "전체" || selectedCategory === ""
      ? quizSets
      : quizSets.filter((item) => item.category === selectedCategory);
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedQuizSetId("");
  };

  const startQuiz = () => {
    if (!nickname.trim()) return;

    const selectedQuizSet = quizSets.find(
      (quizSet) => quizSet.id === selectedQuizSetId,
    );

    if (!selectedQuizSet) return;

    localStorage.setItem("nickname", nickname.trim());

    const shuffled = [...selectedQuizSet.questions].sort(
      () => Math.random() - 0.5,
    );
    const selected = shuffled.slice(0, 10);

    setStartTime(Date.now());
    setFinishTime(null);
    setTimeLeft(TIME_LIMIT);
    setCorrectCount(0);
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
      setScore((prev) => prev + 100 + timeLeft);
      setCorrectCount((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < quizQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setIsAnswerChecked(false);
        setTimeLeft(TIME_LIMIT);
      } else {
        setFinishTime(Date.now());

        setIsStarted(false);
        setIsFinished(true);
        setSelectedChoice(null);
        setIsAnswerChecked(false);
      }
    }, 300);
  };
  const saveRanking = (finishedAt: number) => {
    if (!startTime) return;

    const selectedQuizSet = quizSets.find(
      (quizSet) => quizSet.id === selectedQuizSetId,
    );

    if (!selectedQuizSet) return;

    const elapsedSeconds = Math.ceil((finishedAt - startTime) / 1000);

    const newRecord: RankingRecord = {
      id: crypto.randomUUID(),
      nickname,
      quizSetId: selectedQuizSet.id,
      quizSetTitle: selectedQuizSet.title,
      category: selectedQuizSet.category,
      score,
      correctCount,
      totalQuestions: quizQuestions.length,
      elapsedSeconds,
      createdAt: new Date().toISOString(),
    };

    const nextRankings = [newRecord, ...rankings]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.elapsedSeconds - b.elapsedSeconds;
      })
      .slice(0, 20);

    setRankings(nextRankings);
    localStorage.setItem("rankings", JSON.stringify(nextRankings));
  };

  return (
    <main className="min-h-screen px-4 py-4 ">
      {!isStarted && !isFinished && (
        <StartScreen
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          quizSets={visibleQuizSets}
          selectedQuizSetId={selectedQuizSetId}
          onSelectQuizSet={setSelectedQuizSetId}
          onStartQuiz={startQuiz}
          nickname={nickname}
          onChangeNickname={setNickname}
        />
      )}

      {isStarted && currentQuestion && (
        <QuizScreen
          currentIndex={currentIndex}
          quizQuestions={quizQuestions}
          currentQuestion={currentQuestion}
          isAnswerChecked={isAnswerChecked}
          selectedChoice={selectedChoice}
          onSelectChoice={selectChoice}
          timeLeft={timeLeft}
        />
      )}
      {isFinished && (
        <ResultScreen
          quizQuestions={quizQuestions}
          score={score}
          answers={answers}
          startQuiz={startQuiz}
          startTime={startTime}
          finishTime={finishTime}
          correctCount={correctCount}
          rankings={rankings}
          selectedQuizSetId={selectedQuizSetId}
        />
      )}
    </main>
  );
}
