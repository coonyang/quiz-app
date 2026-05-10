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
import type {
  RankingRecord,
  Question,
  QuizSet,
  Room,
  ChatMessage,
} from "../types/quiz";

export default function HomeClient() {
  const TIME_LIMIT = 30;

  /* 혼자 풀기 퀴즈 상태 */
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  /* 유저와 문제집 상태 */
  const [nickname, setNickname] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedQuizSetId, setSelectedQuizSetId] = useState("");
  const [customQuizSets, setCustomQuizSets] = useState<QuizSet[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuizSet, setEditingQuizSet] = useState<QuizSet | null>(null);

  /* 랭킹 상태 */
  const [rankings, setRankings] = useState<RankingRecord[]>([]);

  /* 온라인 방 상태 */
  const [playMode, setPlayMode] = useState<"solo" | "online">("solo");
  const [enteredRoomId, setEnteredRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [currentPlayerId] = useState(() => crypto.randomUUID());

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

  const currentQuestion = quizQuestions[currentIndex];

  /* localStorage에 저장된 데이터 불러오기 */
  useEffect(() => {
    const savedCustomQuizSets = localStorage.getItem("customQuizSets");

    if (savedCustomQuizSets) {
      setCustomQuizSets(JSON.parse(savedCustomQuizSets));
    }
  }, []);

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");

    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  useEffect(() => {
    const savedRankings = localStorage.getItem("rankings");

    if (savedRankings) {
      setRankings(JSON.parse(savedRankings));
    }
  }, []);

  /* 혼자 풀기 퀴즈 타이머 */
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

  /* 퀴즈 종료 후 랭킹 저장 */
  useEffect(() => {
    if (!isFinished || !finishTime || !startTime) return;

    saveRanking(finishTime);
  }, [isFinished, finishTime]);

  /* 온라인 방 관련 함수 */
  const createRoom = (room: Room) => {
    setRooms((prev) => [room, ...prev]);
    setIsCreateRoomModalOpen(false);
    setEnteredRoomId(room.id);
  };

  const enterRoom = (roomId: string) => {
    const playerNickname = nickname.trim() || "익명";

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;

        const alreadyJoined = room.players.some(
          (player) => player.id === currentPlayerId,
        );

        if (alreadyJoined) return room;

        if (room.players.length >= room.maxPlayers) return room;

        return {
          ...room,
          players: [
            ...room.players,
            {
              id: currentPlayerId,
              nickname: playerNickname,
              isHost: false,
              score: 0,
            },
          ],
        };
      }),
    );

    setEnteredRoomId(roomId);
  };

  const leaveRoom = () => {
    if (!enteredRoomId) return;

    setRooms((prev) =>
      prev
        .map((room) =>
          room.id === enteredRoomId
            ? {
                ...room,
                players: room.players.filter(
                  (player) => player.id !== currentPlayerId,
                ),
              }
            : room,
        )
        .filter((room) => room.players.length > 0),
    );

    setEnteredRoomId(null);
  };

  const enteredRoom = rooms.find((room) => room.id === enteredRoomId);

  const sendRoomMessage = (roomId: string, message: ChatMessage) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              messages: [...room.messages, message],
            }
          : room,
      ),
    );
  };

  const startRoomGame = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, status: "playing" } : room,
      ),
    );
  };
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
  const startQuiz = () => {
    if (!nickname.trim()) return;

    const selectedQuizSet = allQuizSets.find(
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

  const goHome = () => {
    setIsStarted(false);
    setIsFinished(false);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsAnswerChecked(false);
    setAnswers([]);
    setScore(0);
    setCorrectCount(0);
    setStartTime(null);
    setFinishTime(null);
    setTimeLeft(TIME_LIMIT);
  };

  /* 랭킹 관련 함수 */
  const saveRanking = (finishedAt: number) => {
    if (!startTime) return;

    const selectedQuizSet = allQuizSets.find(
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
    <main className="min-h-screen px-4 py-4">
      <div className="mx-auto max-w-6xl">
        <section className="min-w-0">
          {!isStarted && !isFinished && (
            <>
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
                    onChangeNickname={setNickname}
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
                      onCreateRoom={createRoom}
                    />
                  )}
                </>
              )}

              {playMode === "online" && enteredRoom && (
                <RoomScreen
                  room={enteredRoom}
                  nickname={nickname}
                  onLeaveRoom={leaveRoom}
                  currentPlayerId={currentPlayerId}
                  onSendMessage={sendRoomMessage}
                  onStartGame={startRoomGame}
                />
              )}
            </>
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
              onGoHome={goHome}
            />
          )}
        </section>
      </div>
    </main>
  );
}
