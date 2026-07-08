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
  currentPlayerId: string;
};

export default function CreateQuizSetModal({
  nickname,
  categories,
  onClose,
  onCreateQuizSet,
  onUpdateQuizSet,
  editingQuizSet,
  currentPlayerId,
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
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  const saveQuestion = () => {
    if (!questionText.trim()) {
      setErrorMessage("문제를 입력해주세요.");
      return;
    }
    if (!category.trim()) {
      setErrorMessage("카테고리를 선택해주세요.");
      return;
    }
    if (choices.some((choice) => !choice.trim())) {
      setErrorMessage("선택지를 모두 입력해주세요.");
      return;
    }

    if (editingQuestionId) {
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === editingQuestionId
            ? {
                ...question,
                question: questionText.trim(),
                choices: choices.map((choice) => choice.trim()),
                answerIndex,
              }
            : question,
        ),
      );

      setEditingQuestionId(null);
    } else {
      const newQuestion: Question = {
        id: Date.now(),
        question: questionText.trim(),
        choices: choices.map((choice) => choice.trim()),
        answerIndex,
      };

      setQuestions((prev) => {
        const nextQuestions = [...prev, newQuestion];
        setPreviewIndex(nextQuestions.length - 1);
        return nextQuestions;
      });
    }

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
      authorId: currentPlayerId,
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

  const startEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question);
    setChoices(question.choices);
    setAnswerIndex(question.answerIndex);
  };

  return (
    <div className="modal-overlay">
      <section className="modal-panel max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingQuizSet ? "문제집 수정" : "문제집 만들기"}
          </h2>
          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}
          <button
            className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="grid gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문제집 제목"
            className="input"
          ></input>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            <option value="">카테고리를 선택하세요</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="mb-3 font-semibold text-slate-700">문제 추가</h3>

            <input
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="문제"
              className="input mb-3 w-full"
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
                    className="input flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => setAnswerIndex(index)}
                    className={`rounded-lg px-3 text-sm font-medium transition-colors ${
                      answerIndex === index
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    정답
                  </button>
                </div>
              ))}
            </div>

            <button className="btn-primary mt-3 w-full" onClick={saveQuestion}>
              {editingQuestionId ? "문제 수정 완료" : "문제 추가"}
            </button>
          </div>

          <p className="text-sm text-slate-500">
            추가된 문제: {questions.length}개
          </p>
          {previewQuestion && (
            <div className="card text-left">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-slate-900">
                  {previewIndex + 1} / {questions.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditQuestion(previewQuestion)}
                    className="btn-outline btn-sm whitespace-nowrap"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(previewQuestion.id)}
                    className="btn-danger btn-sm whitespace-nowrap"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <p className="font-semibold text-slate-900">
                {previewQuestion.question}
              </p>

              <ul className="mt-2 grid gap-1 text-sm text-slate-600">
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
                  className="btn-outline btn-sm"
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
                  className="btn-outline btn-sm"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          <button
            className="btn-primary py-3"
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
