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
import type { RankingRecord, QuizSet } from "../types/quiz";

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

  /* 랭킹 상태 */
  const [rankings, setRankings] = useState<RankingRecord[]>([]);

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

  /* localStorage에 저장된 데이터 불러오기 */
  useEffect(() => {
    const savedCustomQuizSets = localStorage.getItem("customQuizSets");

    if (savedCustomQuizSets) {
      setCustomQuizSets(JSON.parse(savedCustomQuizSets));
    }
  }, []);

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
    const savedRankings = localStorage.getItem("rankings");

    if (savedRankings) {
      setRankings(JSON.parse(savedRankings));
    }
  }, []);

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
    const nextCustomQuizSets = [...customQuizSets, newQuizSet];

    setCustomQuizSets(nextCustomQuizSets);
    localStorage.setItem("customQuizSets", JSON.stringify(nextCustomQuizSets));

    setSelectedCategory(newQuizSet.category);
    setSelectedQuizSetId(newQuizSet.id);
    setIsCreateModalOpen(false);
  };

  const updateQuizSet = (updatedQuizSet: QuizSet) => {
    const nextCustomQuizSets = customQuizSets.map((quizSet) =>
      quizSet.id === updatedQuizSet.id ? updatedQuizSet : quizSet,
    );

    setCustomQuizSets(nextCustomQuizSets);
    localStorage.setItem("customQuizSets", JSON.stringify(nextCustomQuizSets));

    setEditingQuizSet(null);
  };

  const deleteCustomQuizSet = (quizSetId: string) => {
    const nextCustomQuizSets = customQuizSets.filter(
      (quizSet) => quizSet.id !== quizSetId,
    );

    setCustomQuizSets(nextCustomQuizSets);
    localStorage.setItem("customQuizSets", JSON.stringify(nextCustomQuizSets));

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

    nickname,

    rankings,

    setRankings,
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
    <main className="min-h-screen px-4 py-4">
      <div className="mx-auto max-w-6xl">
        {isNicknameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <section className="w-full max-w-sm rounded-lg bg-white p-6 text-black">
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
                className="mt-4 w-full rounded-md border px-4 py-2"
                autoFocus
              />

              <button
                onClick={saveNickname}
                disabled={!nicknameInput.trim()}
                className="mt-4 w-full rounded-md bg-black px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                시작하기
              </button>
            </section>
          </div>
        )}
        {nickname && !enteredRoomId && (
          <div className="mb-4 flex justify-end">
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
              <span className="text-gray-500">닉네임</span>
              <span className="font-semibold">{nickname}</span>

              <button
                type="button"
                onClick={() => {
                  setNicknameInput(nickname);
                  setIsNicknameModalOpen(true);
                }}
                className="ml-2 rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
              >
                변경
              </button>
            </div>
          </div>
        )}

        <section className="min-w-0">
          {!currentQuestion && !isQuizFinished && (
            <>
              {!enteredRoomId && (
                <div className="mx-auto mb-4 flex max-w-xl gap-2">
                  <button
                    onClick={() => setPlayMode("solo")}
                    className={`flex-1 rounded-md border px-4 py-2 ${
                      playMode === "solo"
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    혼자 풀기
                  </button>

                  <button
                    onClick={() => setPlayMode("online")}
                    className={`flex-1 rounded-md border px-4 py-2 ${
                      playMode === "online"
                        ? "bg-black text-white"
                        : "bg-white text-black"
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
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  />

                  {(isCreateModalOpen || editingQuizSet) && (
                    <CreateQuizSetModal
                      nickname={nickname}
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
                <p>방 입장 중...</p>
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
              rankings={rankings}
              selectedQuizSetId={selectedQuizSetId}
              onGoHome={goHome}
            />
          )}
        </section>
      </div>
    </main>
  );
}
