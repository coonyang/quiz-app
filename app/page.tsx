import { questions } from "./data/questions";

export default function Home() {
  return (
    <main>
      <h1>퀴즈 목록</h1>

      {questions.map((item) => (
        <section key={item.id}>
          <h2>{item.question}</h2>

          {item.choices.map((choice, index) => (
            <button key={choice}>
              {index + 1}. {choice}
            </button>
          ))}
        </section>
      ))}
    </main>
  );
}
