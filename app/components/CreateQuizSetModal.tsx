"use client";

import { useState } from "react";
import type { Question, QuizSet } from "../types/quiz";

type CreateQuizSetModalProps = {
  nickname: string;
  editingQuizSet: QuizSet | null;
  onClose: () => void;
  categories: string[];
  onCreateQuizSet: (quizSet: QuizSet) => void;
  onUpdateQuizSet: (quizSet: QuizSet) => void;
};

export default function CreateQuizSetModal({
  nickname,
  categories,
  onClose,
  onCreateQuizSet,
  onUpdateQuizSet,
  editingQuizSet,
}: CreateQuizSetModalProps) {
  const [title, setTitle] = useState(editingQuizSet?.title ?? "");
  const [category, setCategory] = useState(editingQuizSet?.category ?? "");
  const [questions, setQuestions] = useState<Question[]>(
    editingQuizSet?.questions ?? [],
  );
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewQuestion = questions[previewIndex];

  const addQuestion = () => {
    if (!questionText.trim()) return;
    if (choices.some((choice) => !choice.trim())) return;

    const newQuestion: Question = {
      id: Date.now(),
      question: questionText.trim(),
      choices: choices.map((choice) => choice.trim()),
      answerIndex,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setQuestionText("");
    setChoices(["", "", "", ""]);
    setAnswerIndex(0);
  };

  const saveQuizSet = () => {
    if (!title.trim()) return;
    if (!category.trim()) return;
    if (questions.length === 0) return;

    const quizSet: QuizSet = {
      id: editingQuizSet?.id ?? crypto.randomUUID(),
      title: title.trim(),
      category: category.trim(),
      author: (editingQuizSet?.author ?? nickname.trim()) || "익명",
      questions,
    };

    if (editingQuizSet) {
      onUpdateQuizSet(quizSet);
    } else {
      onCreateQuizSet(quizSet);
    }
  };

  const deleteQuestion = (questionId: number) => {
    setQuestions((prev) => {
      const nextQuestions = prev.filter(
        (question) => question.id !== questionId,
      );

      setPreviewIndex((currentIndex) => {
        if (nextQuestions.length === 0) return 0;
        return Math.min(currentIndex, nextQuestions.length - 1);
      });

      return nextQuestions;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 text-black">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingQuizSet ? "문제집 수정" : "문제집 만들기"}
          </h2>
          <button className="rounded-md border px-3 py-1" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문제집 제목"
            className="rounded-md border px-4 py-2"
          ></input>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border px-4 py-2"
          >
            <option value="">카테고리를 선택하세요</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">문제 추가</h3>

            <input
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="문제"
              className="mb-3 w-full rounded-md border px-4 py-2"
            />

            <div className="grid gap-2">
              {choices.map((choice, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={choice}
                    onChange={(event) => {
                      const nextChoices = [...choices];
                      nextChoices[index] = event.target.value;
                      setChoices(nextChoices);
                    }}
                    placeholder={`선택지 ${index + 1}`}
                    className="flex-1 rounded-md border px-4 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => setAnswerIndex(index)}
                    className={`rounded-md border px-3 ${
                      answerIndex === index
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    정답
                  </button>
                </div>
              ))}
            </div>

            <button
              className="mt-3 w-full rounded-md border px-4 py-2 hover:bg-emerald-300"
              onClick={addQuestion}
            >
              문제 추가
            </button>
          </div>

          <p className="text-sm">추가된 문제: {questions.length}개</p>
          {previewQuestion && (
            <div className="rounded-md border p-3 text-left">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">
                  {previewIndex + 1} / {questions.length}
                </p>

                <button
                  type="button"
                  onClick={() => deleteQuestion(previewQuestion.id)}
                  className="whitespace-nowrap rounded-md border px-3 py-1 text-sm hover:bg-red-100"
                >
                  삭제
                </button>
              </div>

              <p className="font-semibold">{previewQuestion.question}</p>

              <ul className="mt-2 grid gap-1 text-sm">
                {previewQuestion.choices.map((choice, choiceIndex) => (
                  <li
                    key={`${choice}-${choiceIndex}`}
                    className={
                      choiceIndex === previewQuestion.answerIndex
                        ? "font-semibold text-emerald-600"
                        : ""
                    }
                  >
                    {choiceIndex + 1}. {choice}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={previewIndex === 0}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
                >
                  이전
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1),
                    )
                  }
                  disabled={previewIndex === questions.length - 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          <button
            className="rounded-md bg-black px-5 py-3 font-semibold text-white disabled:opacity-40"
            onClick={saveQuizSet}
            disabled={!title.trim() || !category || questions.length === 0}
          >
            {editingQuizSet ? "문제집 수정" : "문제집 저장"}
          </button>
        </div>
      </section>
    </div>
  );
}
