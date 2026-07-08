import type { QuizSet } from "../types/quiz";

type StartScreenProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  quizSets: QuizSet[];
  selectedQuizSetId: string;
  onSelectQuizSet: (quizSetId: string) => void;
  onStartQuiz: () => void;
  nickname: string;
  customQuizSets: QuizSet[];
  onDeleteQuizSet: (quizSetId: string) => void;
  onEditQuizSet: (quizSet: QuizSet) => void;
  onOpenCreateModal: () => void;
  currentPlayerId: string;
  questionCount: number;
  setQuestionCount: React.Dispatch<React.SetStateAction<number>>;
};
export default function StartScreen({
  categories,
  selectedCategory,
  onSelectCategory,
  quizSets,
  selectedQuizSetId,
  onSelectQuizSet,
  onStartQuiz,
  nickname,
  customQuizSets,
  onDeleteQuizSet,
  onEditQuizSet,
  onOpenCreateModal,
  currentPlayerId,
  questionCount,
  setQuestionCount,
}: StartScreenProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-3xl font-bold text-slate-900">퀴즈 목록</h1>

      <div className="card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">문제집 선택</h2>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn-outline btn-sm"
          >
            + 문제집 만들기
          </button>
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              카테고리 선택
            </h2>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                선택한 카테고리: {selectedCategory}
              </p>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="input py-1.5"
              >
                <option value={10}>10문제</option>
                <option value={15}>15문제</option>
                <option value={20}>20문제</option>
              </select>
            </div>
          </div>

          {quizSets.map((quizSet) => {
            const isCustomQuizSet = customQuizSets.some(
              (customQuizSet) => customQuizSet.id === quizSet.id,
            );

            const canDeleteQuizSet =
              isCustomQuizSet && quizSet.authorId === currentPlayerId;
            const isSelected = selectedQuizSetId === quizSet.id;
            return (
              <div
                key={quizSet.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:border-emerald-300"
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => onSelectQuizSet(quizSet.id)}
                >
                  <p className="font-semibold">{quizSet.title}</p>
                  <p
                    className={`text-sm ${
                      isSelected ? "text-emerald-50" : "text-slate-500"
                    }`}
                  >
                    {quizSet.category} · {quizSet.author}
                  </p>
                </button>
                {canDeleteQuizSet && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => onEditQuizSet(quizSet)}
                      className={`whitespace-nowrap rounded-md px-3 py-1 text-sm transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuizSet(quizSet.id)}
                      className={`whitespace-nowrap rounded-md px-3 py-1 text-sm transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "border border-red-200 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="btn-primary py-3 text-base"
        onClick={onStartQuiz}
        disabled={!nickname.trim() || !selectedQuizSetId}
      >
        시작하기
      </button>
    </section>
  );
}
