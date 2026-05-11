"use client";

import { useState } from "react";
import type { Room, ChatMessage } from "../types/quiz";

type RoomScreenProps = {
  room: Room;
  nickname: string;
  onLeaveRoom: () => void;
  currentPlayerId: string;
  onSendMessage: (roomId: string, message: ChatMessage) => void;
  onStartGame: (roomId: string) => void;
  submitRoomAnswer: (
    roomId: string,
    playerId: string,
    choiceIndex: number,
  ) => void;
  goNextRoomQuestion: (roomId: string) => void;
};

export default function RoomScreen({
  room,
  nickname,
  onLeaveRoom,
  currentPlayerId,
  onSendMessage,
  onStartGame,
  submitRoomAnswer,
  goNextRoomQuestion,
}: RoomScreenProps) {
  const [messageText, setMessageText] = useState("");
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

  return (
    <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">room id:{room.id}</p>
              <h1 className="text-2xl font-bold">{room.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                문제집: {room.quizSetTitle}
              </p>
            </div>

            <button
              onClick={onLeaveRoom}
              className="rounded-md border px-4 py-2 hover:bg-gray-100"
            >
              나가기
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="mb-3 text-lg font-semibold">참가자</h2>

          <div className="grid gap-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">
                    {player.nickname}
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

        <div className="rounded-lg border p-5">
          <h2 className="mb-3 text-lg font-semibold">게임</h2>
          {room.status === "waiting" ? (
            <p className="text-sm text-gray-500">
              아직 게임이 시작되지 않았습니다.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500">게임이 진행중입니다.</p>
              <div>
                <p>
                  {room.currentQuestionIndex + 1} / {room.quizQuestions.length}
                </p>
                <h2>{currentQuestion.question}</h2>

                {currentQuestion.choices.map((choice, index) => (
                  <button
                    onClick={() =>
                      submitRoomAnswer(room.id, currentPlayerId, index)
                    }
                    disabled={hasAnswered}
                    key={index}
                  >
                    {choice}
                  </button>
                ))}
                {isHost && hasAnswered && (
                  <button
                    onClick={() => goNextRoomQuestion(room.id)}
                    className="mt-4 rounded-md border px-4 py-2 hover:bg-gray-100"
                  >
                    다음 문제
                  </button>
                )}
              </div>
            </>
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
        </div>
      </div>

      <aside className="flex min-h-[520px] flex-col rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-semibold">채팅</h2>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
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
