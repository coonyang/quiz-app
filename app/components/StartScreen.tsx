type StartScreenProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onStartQuiz: () => void;
};

export default function StartScreen({
  categories,
  selectedCategory,
  onSelectCategory,
  onStartQuiz,
}: StartScreenProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="mt-2 text-3xl font-bold">퀴즈 목록</h1>

      <div className="rounded-lg border p-5">
        <h2 className="mb-3 text-lg font-semibold">카테고리 선택</h2>

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

        <p className="mt-2">선택한 카테고리 : {selectedCategory}</p>
      </div>

      <button
        className="rounded-md border px-5 py-3 hover:bg-emerald-300"
        onClick={onStartQuiz}
      >
        시작하기
      </button>
    </section>
  );
}
