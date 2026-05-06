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
  onChangeNickname: (nickname: string) => void;
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
  onChangeNickname,
}: StartScreenProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <input
        value={nickname}
        onChange={(event) => onChangeNickname(event.target.value)}
        placeholder="닉네임을 입력하세요"
        className="rounded-md border px-4 py-2"
      />
      <h1 className="mt-2 text-3xl font-bold">퀴즈 목록</h1>

      <div className="rounded-lg border p-5">
        <h2 className="mb-3 text-lg font-semibold">문제집 선택</h2>

        <div className="grid gap-2">
          <div className="rounded-lg border p-5">
            <h2 className="mb-3 font-semibold">카테고리 선택</h2>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className={`rounded-md border px-4 py-2 ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <p className="mt-2 text-sm">선택한 카테고리: {selectedCategory}</p>
          </div>

          {quizSets.map((quizSet) => (
            <button
              key={quizSet.id}
              onClick={() => onSelectQuizSet(quizSet.id)}
              className={`rounded-md border px-4 py-3 text-left ${
                selectedQuizSetId === quizSet.id
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              <p className="font-semibold">{quizSet.title}</p>
              <p className="text-sm">
                {quizSet.category} · {quizSet.author}
              </p>
            </button>
          ))}
        </div>
      </div>

      <button
        className="rounded-md border px-5 py-3 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onStartQuiz}
        disabled={!nickname.trim() || !selectedQuizSetId}
      >
        시작하기
      </button>
    </section>
  );
}
