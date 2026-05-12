"use client";

import { useState } from "react";
import type { Room, QuizSet } from "../types/quiz";

type CreateRoomModalProps = {
  nickname: string;
  currentPlayerId: string;
  quizSets: QuizSet[];
  onClose: () => void;
  onCreateRoom: (room: Room) => void;
};
export default function CreateRoomModal({
  nickname,
  currentPlayerId,
  quizSets,
  onClose,
  onCreateRoom,
}: CreateRoomModalProps) {
  const [title, setTitle] = useState("");
  const [quizSetId, setQuizSetId] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [errorMessage, setErrorMessage] = useState("");
  const createRoom = () => {
    const selectedQuizSet = quizSets.find(
      (quizSet) => quizSet.id === quizSetId,
    );

    if (!title.trim()) {
      setErrorMessage("방 제목을 입력해주세요.");
      return;
    }

    if (!selectedQuizSet) {
      setErrorMessage("문제집을 선택해주세요.");
      return;
    }
    const hostNickname = nickname.trim() || "익명";
    const newRoom: Room = {
      id: crypto.randomUUID(),
      title: title.trim(),
      quizSetId: selectedQuizSet.id,
      quizSetTitle: selectedQuizSet.title,
      hostNickname,
      players: [
        {
          id: currentPlayerId,
          nickname: hostNickname,
          isHost: true,
          score: 0,
        },
      ],
      maxPlayers,
      messages: [
        {
          id: crypto.randomUUID(),
          playerId: "system",
          nickname: "시스템",
          message: `${hostNickname}님이 방을 만들었습니다.`,
          createdAt: new Date().toISOString(),
        },
      ],
      status: "waiting",
      currentQuestionIndex: 0,
      quizQuestions: selectedQuizSet.questions,
      questionStartedAt: null,
      timeLimit: 30,
    };

    onCreateRoom(newRoom);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-xl rounded-lg bg-white p-6 text-black">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">방 만들기</h2>

          <button className="rounded-md border px-3 py-1" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="grid gap-3">
          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="방 제목"
            className="rounded-md border px-4 py-2"
          />

          <select
            value={quizSetId}
            onChange={(e) => setQuizSetId(e.target.value)}
            className="rounded-md border px-4 py-2"
          >
            <option value="">문제집을 선택하세요</option>

            {quizSets.map((quizSet) => (
              <option key={quizSet.id} value={quizSet.id}>
                {quizSet.title} · {quizSet.category}
              </option>
            ))}
          </select>

          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="rounded-md border px-4 py-2"
          >
            <option value={2}>2명</option>
            <option value={4}>4명</option>
            <option value={6}>6명</option>
            <option value={8}>8명</option>
          </select>

          <button
            onClick={createRoom}
            className="rounded-md bg-black px-5 py-3 font-semibold text-white hover:bg-zinc-800"
          >
            방 생성
          </button>
        </div>
      </section>
    </div>
  );
}
