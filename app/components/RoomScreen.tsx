"use client";

import { useEffect, useRef, useState } from "react";
import type { Room, ChatMessage, QuizSet } from "../types/quiz";

type RoomScreenProps = {
  room: Room;
  nickname: string;
  onLeaveRoom: () => void;
  currentPlayerId: string;
  onSendMessage: (roomId: string, message: ChatMessage) => void;
  onStartGame: (roomId: string) => void;
  onTimeOver: (roomId: string) => void;
  onCountdownEnd: (roomId: string) => void;
  onRestartRoomGame: (roomId: string) => void;
  quizSets: QuizSet[];
  onUpdateRoomQuizSet: (roomId: string, quizSetId: string) => void;
  onNextQuestion: (roomId: string) => void;
  submitRoomAnswer: (
    roomId: string,
    playerId: string,
    choiceIndex: number,
    timeLeft: number,
  ) => void;
};

export default function RoomScreen({
  room,
  nickname,
  quizSets,
  onLeaveRoom,
  currentPlayerId,
  onSendMessage,
  onStartGame,
  submitRoomAnswer,
  onTimeOver,
  onCountdownEnd,
  onRestartRoomGame,
  onNextQuestion,
  onUpdateRoomQuizSet,
}: RoomScreenProps) {
  const [messageText, setMessageText] = useState("");
  const [now, setNow] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [resultCountdown, setResultCountdown] = useState<number | null>(null);
  const [selectedQuizSetCategory, setSelectedQuizSetCategory] =
    useState("전체");

  const quizSetCategories = [
    "전체",
    ...new Set(quizSets.map((quizSet) => quizSet.category)),
  ];

  const visibleQuizSets =
    selectedQuizSetCategory === "전체"
      ? quizSets
      : quizSets.filter(
          (quizSet) => quizSet.category === selectedQuizSetCategory,
        );
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const remainingMs = room.questionStartedAt
    ? room.timeLimit * 1000 - (now - room.questionStartedAt)
    : room.timeLimit * 1000;

  const rawTimeLeft = Math.ceil(remainingMs / 1000);

  const timeLeft = Math.min(room.timeLimit, Math.max(rawTimeLeft, 0));

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [room.messages]);

  useEffect(() => {
    if (room.status !== "playing") return;

    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, [room.status]);

  useEffect(() => {
    if (room.status !== "playing") return;
    if (timeLeft > 0) return;
    onTimeOver(room.id);
  }, [timeLeft, room.status, room.id, onTimeOver]);

  useEffect(() => {
    if (room.status !== "countdown") return;

    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return 3;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [room.status]);

  useEffect(() => {
    if (room.status !== "countdown") return;

    if (countdown !== null && countdown <= 0) {
      onCountdownEnd(room.id);
    }
  }, [countdown, room.status, room.id, onCountdownEnd]);

  useEffect(() => {
    if (room.status !== "result") return;

    const timerId = setInterval(() => {
      setResultCountdown((prev) => {
        if (prev === null) return 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [room.status]);

  useEffect(() => {
    if (room.status !== "result") return;

    if (resultCountdown !== null && resultCountdown <= 0) {
      onNextQuestion(room.id);
    }
  }, [resultCountdown, room.status, room.id, onNextQuestion]);

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      nickname: nickname.trim() || "익명",
      message: messageText,
      createdAt: new Date().toISOString(),
      playerId: currentPlayerId,
    };

    onSendMessage(room.id, newMessage);
    setMessageText("");
  };
  const isHost = room.players.some(
    (player) => player.id === currentPlayerId && player.isHost,
  );
  const currentQuestion = room.quizQuestions[room.currentQuestionIndex];
  const currentPlayer = room.players.find(
    (player) => player.id === currentPlayerId,
  );
  const hasAnswered =
    currentPlayer?.answeredQuestionIndex === room.currentQuestionIndex;
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <section className="mx-auto grid min-h-[80vh] max-w-6xl  gap-4 grid-cols-[70%_30%]">
      <div className="flex flex-col gap-4 h-full">
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">room id:{room.id}</p>
              <h1 className="text-2xl font-bold">{room.title}</h1>
              <div className="mt-1 text-sm text-gray-500">
                {isHost && room.status === "waiting" ? (
                  <div className="mt-1 flex gap-2">
                    <select
                      value={selectedQuizSetCategory}
                      onChange={(e) => {
                        setSelectedQuizSetCategory(e.target.value);
                      }}
                      className="rounded-md border px-2 py-1 "
                    >
                      {quizSetCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={room.quizSetId}
                      onChange={(e) => {
                        onUpdateRoomQuizSet(room.id, e.target.value);
                      }}
                      className=" rounded-md border px-2 py-1 "
                    >
                      {visibleQuizSets.map((quizSet) => (
                        <option key={quizSet.id} value={quizSet.id}>
                          {quizSet.title} · {quizSet.category}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  `문제집: ${room.quizSetTitle}`
                )}
              </div>
            </div>

            <button
              onClick={onLeaveRoom}
              className="rounded-md border px-4 py-2 hover:bg-gray-100"
            >
              나가기
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col rounded-lg border p-5 min-h-[410px]">
          <h2 className="mb-3 text-lg font-semibold">게임</h2>

          {room.status === "waiting" && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="text-sm text-gray-500">
                아직 게임이 시작되지 않았습니다.
              </p>
            </div>
          )}
          {isHost && room.status === "waiting" && (
            <button
              onClick={() => {
                onStartGame(room.id);
              }}
              className="mt-4 w-full rounded-md border px-5 py-3 hover:bg-emerald-300"
            >
              게임 시작
            </button>
          )}
          {room.status === "countdown" && (
            <div className="flex flex-1 flex-col items-center justify-center">
              {countdown ?? "잠시 후 게임이 시작됩니다..."}
            </div>
          )}
          {room.status === "playing" && (
            <>
              <p className="text-sm text-gray-500">게임이 진행중입니다.</p>
              <p className="mt-4 mb-4">남은 시간: {timeLeft}초</p>
              <div className="mb-6 h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full  ${
                    timeLeft <= 5 ? "bg-red-400" : "bg-emerald-400"
                  }`}
                  style={{
                    width: `${(timeLeft / room.timeLimit) * 100}%`,
                  }}
                />
              </div>
              <div className=" flex flex-col ">
                <p>
                  {room.currentQuestionIndex + 1} / {room.quizQuestions.length}
                </p>
                <h2 className="break-all text-3xl font-bold text-center">
                  {currentQuestion.question}
                </h2>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      submitRoomAnswer(
                        room.id,
                        currentPlayerId,
                        index,
                        timeLeft,
                      )
                    }
                    disabled={hasAnswered}
                    className={`min-h-[50px] overflow-y-auto rounded-xl border px-5 py-4 text-left text-lg font-medium transition-all ${
                      hasAnswered
                        ? "cursor-not-allowed bg-gray-100 opacity-70"
                        : "hover:scale-[1.01] hover:bg-emerald-100"
                    }`}
                  >
                    <span className="mr-3 font-bold text-emerald-600">
                      {index + 1}.
                    </span>

                    {choice}
                  </button>
                ))}
              </div>
            </>
          )}
          {room.status === "result" && (
            <p>{resultCountdown ?? 2}초 후 다음 문제로 넘어갑니다...</p>
          )}
          {room.status === "finished" && (
            <div>
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">최종 순위</h3>
                {isHost && (
                  <button
                    className=" rounded border p-2 mr-2 hover:bg-gray-100"
                    onClick={() => onRestartRoomGame(room.id)}
                  >
                    다시하기
                  </button>
                )}
              </div>
              <div className="mt-3 grid max-h-[285px] gap-2 overflow-y-auto pr-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {index + 1}. {player.nickname}
                        {player.id === currentPlayerId ? " (나)" : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {player.isHost ? "방장" : "참가자"}
                      </p>
                    </div>

                    <p className="font-semibold">{player.score}점</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col rounded-lg border p-5">
        <h2 className="mb-3 text-lg font-semibold">참가자</h2>

        <div className="grid gap-2">
          {Array.from({ length: room.maxPlayers }).map((_, index) => {
            const player = room.players[index];
            if (player) {
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="min-w-[100px]">
                    <p className="font-semibold">
                      {player.nickname}
                      {player.id === currentPlayerId ? " (나)" : ""}
                      {player.answeredQuestionIndex ===
                        room.currentQuestionIndex &&
                        room.status === "playing" &&
                        (player.isLastAnswerCorrect ? "✅" : "❌")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {player.isHost ? "방장" : "참가자"}
                    </p>
                  </div>

                  <p className="font-semibold">{player.score}점</p>
                </div>
              );
            }
            if (!player) {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="flex items-center justify-center rounded-md  py-2 text-gray-400">
                    <p className="font-semibold">빈자리</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      <aside className="flex min-h-[400px] flex-col rounded-lg border p-4 lg:h-full">
        <h2 className="mb-3 text-lg font-semibold">채팅</h2>

        <div
          ref={chatContainerRef}
          className="flex-1 space-y-3 overflow-y-auto rounded-md border p-3 max-h-[300px]"
        >
          {room.messages.map((message) => (
            <div key={message.id}>
              <p className="text-sm font-semibold">{message.nickname}</p>
              <p className="text-sm">{message.message}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="메시지 입력"
            className="min-w-0 flex-1 rounded-md border px-3 py-2"
          />

          <button
            onClick={sendMessage}
            className="rounded-md border px-3 py-2 hover:bg-gray-100"
          >
            전송
          </button>
        </div>
      </aside>
    </section>
  );
}
