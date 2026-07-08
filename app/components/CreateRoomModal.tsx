"use client";

import { useState } from "react";
import type { Room, QuizSet } from "../types/quiz";
import { updateCreateRoom } from "../lib/room/updateCreateRoom";

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
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = [
    "전체",
    ...new Set(quizSets.map((quizSet) => quizSet.category)),
  ];

  const visibleQuizSets =
    selectedCategory === "전체"
      ? quizSets
      : quizSets.filter((quizSet) => quizSet.category === selectedCategory);
  const createRoom = () => {
    if (!title.trim()) {
      setErrorMessage("방 제목을 입력해주세요.");
      return;
    }

    const selectedQuizSet = quizSets.find(
      (quizSet) => quizSet.id === quizSetId,
    );

    if (!selectedQuizSet) {
      setErrorMessage("문제집을 선택해주세요.");
      return;
    }

    const newRoom = updateCreateRoom(
      title,
      selectedQuizSet,
      nickname,
      currentPlayerId,
      maxPlayers,
    );

    onCreateRoom(newRoom);
  };
  return (
    <div className="modal-overlay">
      <section className="modal-panel">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">방 만들기</h2>

          <button
            className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
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
            className="input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setQuizSetId("");
            }}
            className="input"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={quizSetId}
            onChange={(e) => setQuizSetId(e.target.value)}
            className="input"
          >
            <option value="">문제집을 선택하세요</option>

            {visibleQuizSets.map((quizSet) => (
              <option key={quizSet.id} value={quizSet.id}>
                {quizSet.title} · {quizSet.category}
              </option>
            ))}
          </select>

          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="input"
          >
            <option value={2}>2명</option>
            <option value={3}>3명</option>
            <option value={4}>4명</option>
            <option value={5}>5명</option>
            <option value={6}>6명</option>
          </select>

          <button onClick={createRoom} className="btn-primary py-3">
            방 생성
          </button>
        </div>
      </section>
    </div>
  );
}
