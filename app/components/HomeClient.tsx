"use client";

import CreateQuizSetModal from "../components/CreateQuizSetModal";
import CreateRoomModal from "./CreateRoomModal";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";
import RoomLobby from "./RoomLobby";
import RoomScreen from "./RoomScreen";
import StartScreen from "./StartScreen";
import { quizSets } from "../data/quizSets";
import { useEffect, useState } from "react";
import type { QuizSet } from "../types/quiz";

import { useRoomGame } from "../hooks/useRoomGame";
import { useSoloQuiz } from "../hooks/useSoloQuiz";
import { socket } from "../lib/socket/socket";
export default function HomeClient() {
  /* 유저와 문제집 상태 */
  const [nickname, setNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedQuizSetId, setSelectedQuizSetId] = useState("");
  const [customQuizSets, setCustomQuizSets] = useState<QuizSet[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuizSet, setEditingQuizSet] = useState<QuizSet | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  /* 온라인 방 상태 */
  const [playMode, setPlayMode] = useState<"solo" | "online">("solo");
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState("");

  /* 화면에서 바로 계산해서 쓰는 데이터 */
  const allQuizSets = [...quizSets, ...customQuizSets];

  const categories = [
    "전체",
    ...new Set(allQuizSets.map((item) => item.category)),
  ];

  const visibleQuizSets =
    selectedCategory === "전체" || selectedCategory === ""
      ? allQuizSets
      : allQuizSets.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    socket.on("quizSetsUpdated", (quizSets: QuizSet[]) => {
      setCustomQuizSets(quizSets);
    });

    return () => {
      socket.off("quizSetsUpdated");
    };
  }, []);

  /* localStorage에 저장된 데이터 불러오기 */

  useEffect(() => {
    const savedPlayerId = localStorage.getItem("currentPlayerId");

    if (savedPlayerId) {
      setCurrentPlayerId(savedPlayerId);
      return;
    }

    const newPlayerId = crypto.randomUUID();
    localStorage.setItem("currentPlayerId", newPlayerId);
    setCurrentPlayerId(newPlayerId);
  }, []);

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");

    if (savedNickname) {
      setNickname(savedNickname);
      setNicknameInput(savedNickname);
      return;
    }

    setIsNicknameModalOpen(true);
  }, []);

  useEffect(() => {
    const exists = visibleQuizSets.some(
      (quizSet) => quizSet.id === selectedQuizSetId,
    );

    if (!exists) {
      setSelectedQuizSetId("");
    }
  }, [visibleQuizSets, selectedQuizSetId]);

  const saveNickname = () => {
    const nextNickname = nicknameInput.trim();

    if (!nextNickname) return;

    setNickname(nextNickname);
    localStorage.setItem("nickname", nextNickname);
    setIsNicknameModalOpen(false);
  };

  /* 온라인 방 관련 함수 */
  const {
    rooms,
    enteredRoomId,
    enteredRoom,

    createRoom,
    enterRoom,
    leaveRoom,

    roomQuizSet,
    sendRoomMessage,

    generateAiRoomQuizSet,
    isGeneratingAiQuestions,
    aiQuizError,

    startRoomGame,
    submitRoomAnswer,

    timeOver,
    countdownEnd,

    restartRoomGame,
    nextQuestion,
  } = useRoomGame({
    allQuizSets,
    nickname,
    currentPlayerId,
  });

  /* 문제집 관리 함수 */
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedQuizSetId("");
  };

  const createQuizSet = (newQuizSet: QuizSet) => {
    socket.emit("createQuizSet", {
      quizSet: newQuizSet,
    });

    setSelectedCategory(newQuizSet.category);
    setSelectedQuizSetId(newQuizSet.id);
    setIsCreateModalOpen(false);
  };

  const updateQuizSet = (updatedQuizSet: QuizSet) => {
    socket.emit("updateQuizSet", {
      quizSet: updatedQuizSet,
      currentPlayerId,
    });

    setEditingQuizSet(null);
  };

  const deleteCustomQuizSet = (quizSetId: string) => {
    socket.emit("deleteQuizSet", {
      quizSetId,
      currentPlayerId,
    });

    if (selectedQuizSetId === quizSetId) {
      setSelectedQuizSetId("");
    }
  };

  /* 혼자 풀기 퀴즈 진행 함수 */
  const {
    quizQuestions,
    currentQuestion,
    currentIndex,
    score,
    correctCount,
    answers,
    selectedChoice,
    isAnswerChecked,
    isQuizFinished,
    startTime,
    finishTime,
    timeLeft,
    startQuiz,
    selectChoice,
    goHome,
  } = useSoloQuiz({
    selectedQuizSet: allQuizSets.find(
      (quizSet) => quizSet.id === selectedQuizSetId,
    ),
    questionCount,
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("연결됨");
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  if (!currentPlayerId) {
    return null;
  }
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {isNicknameModalOpen && (
          <div className="modal-overlay">
            <section className="modal-panel max-w-sm">
              <h2 className="text-xl font-bold">
                {nickname ? "닉네임 변경" : "닉네임 입력"}
              </h2>

              <input
                value={nicknameInput}
                onChange={(event) => setNicknameInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    saveNickname();
                  }
                }}
                placeholder="닉네임"
                className="input mt-4 w-full"
                autoFocus
              />

              <button
                onClick={saveNickname}
                disabled={!nicknameInput.trim()}
                className="btn-primary mt-4 w-full"
              >
                시작하기
              </button>
            </section>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            퀴즈 앱
          </h1>

          {nickname && !enteredRoomId && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm">
              <span className="text-slate-400">닉네임</span>
              <span className="font-semibold text-slate-900">{nickname}</span>

              <button
                type="button"
                onClick={() => {
                  setNicknameInput(nickname);
                  setIsNicknameModalOpen(true);
                }}
                className="ml-1 rounded-full px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
              >
                변경
              </button>
            </div>
          )}
        </div>

        <section className="min-w-0">
          {!currentQuestion && !isQuizFinished && (
            <>
              {!enteredRoomId && (
                <div className="mx-auto mb-6 flex max-w-xl gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setPlayMode("solo")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      playMode === "solo"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    혼자 풀기
                  </button>

                  <button
                    onClick={() => setPlayMode("online")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      playMode === "online"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    온라인 방
                  </button>
                </div>
              )}

              {playMode === "solo" && (
                <>
                  <StartScreen
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    quizSets={visibleQuizSets}
                    selectedQuizSetId={selectedQuizSetId}
                    onSelectQuizSet={setSelectedQuizSetId}
                    onStartQuiz={startQuiz}
                    nickname={nickname}
                    customQuizSets={customQuizSets}
                    onDeleteQuizSet={deleteCustomQuizSet}
                    onEditQuizSet={setEditingQuizSet}
                    currentPlayerId={currentPlayerId}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    questionCount={questionCount}
                    setQuestionCount={setQuestionCount}
                  />

                  {(isCreateModalOpen || editingQuizSet) && (
                    <CreateQuizSetModal
                      nickname={nickname}
                      currentPlayerId={currentPlayerId}
                      editingQuizSet={editingQuizSet}
                      onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingQuizSet(null);
                      }}
                      categories={categories.filter(
                        (category) => category !== "전체",
                      )}
                      onCreateQuizSet={createQuizSet}
                      onUpdateQuizSet={updateQuizSet}
                    />
                  )}
                </>
              )}

              {playMode === "online" && !enteredRoomId && (
                <>
                  <RoomLobby
                    rooms={rooms}
                    onOpenCreateRoomModal={() => setIsCreateRoomModalOpen(true)}
                    onEnterRoom={enterRoom}
                  />

                  {isCreateRoomModalOpen && (
                    <CreateRoomModal
                      nickname={nickname}
                      currentPlayerId={currentPlayerId}
                      quizSets={allQuizSets}
                      onClose={() => setIsCreateRoomModalOpen(false)}
                      onCreateRoom={(room) => {
                        createRoom(room);
                        setIsCreateRoomModalOpen(false);
                      }}
                    />
                  )}
                </>
              )}
              {playMode === "online" && enteredRoomId && !enteredRoom && (
                <p className="text-center text-slate-500">방 입장 중...</p>
              )}
              {playMode === "online" && enteredRoom && (
                <RoomScreen
                  key={`${enteredRoom.id}-${enteredRoom.status}`}
                  room={enteredRoom}
                  nickname={nickname}
                  onLeaveRoom={leaveRoom}
                  currentPlayerId={currentPlayerId}
                  onSendMessage={sendRoomMessage}
                  onStartGame={startRoomGame}
                  submitRoomAnswer={submitRoomAnswer}
                  onTimeOver={timeOver}
                  onCountdownEnd={countdownEnd}
                  onRestartRoomGame={restartRoomGame}
                  quizSets={allQuizSets}
                  onUpdateRoomQuizSet={roomQuizSet}
                  onNextQuestion={nextQuestion}
                  onGenerateAiQuizSet={generateAiRoomQuizSet}
                  isGeneratingAiQuestions={isGeneratingAiQuestions}
                  aiQuizError={aiQuizError}
                />
              )}
            </>
          )}

          {currentQuestion && !isQuizFinished && (
            <QuizScreen
              currentIndex={currentIndex}
              quizQuestions={quizQuestions}
              currentQuestion={currentQuestion}
              isAnswerChecked={isAnswerChecked}
              selectedChoice={selectedChoice}
              onSelectChoice={selectChoice}
              timeLeft={timeLeft}
              goHome={goHome}
            />
          )}

          {isQuizFinished && (
            <ResultScreen
              quizQuestions={quizQuestions}
              score={score}
              answers={answers}
              startQuiz={startQuiz}
              startTime={startTime}
              finishTime={finishTime}
              correctCount={correctCount}
              onGoHome={goHome}
            />
          )}
        </section>
      </div>
    </main>
  );
}
