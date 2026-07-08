import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { Question } from "@/app/types/quiz";

const MIN_COUNT = 1;
const MAX_COUNT = 10;
const DEFAULT_COUNT = 5;

type GenerateQuizRequestBody = {
  topic?: string;
  category?: string;
  count?: number;
};

type GeneratedQuestion = {
  question: string;
  choices: string[];
  answerIndex: number;
};

export async function POST(request: Request) {
  const { topic, category, count }: GenerateQuizRequestBody =
    await request.json();

  if (!topic || !topic.trim()) {
    return NextResponse.json(
      { error: "주제를 입력해주세요." },
      { status: 400 },
    );
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "서버에 GROQ_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 },
    );
  }

  const questionCount = Math.min(
    Math.max(Math.trunc(Number(count) || DEFAULT_COUNT), MIN_COUNT),
    MAX_COUNT,
  );

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "너는 퀴즈 문제 출제자야. 주어진 주제에 맞는 4지선다 객관식 퀴즈 문제를 만들어. 문제는 반드시 한국어로만 작성해. 선택지는 정확히 4개, answerIndex는 0~3 사이의 정답 선택지 위치야.",
        },
        {
          role: "user",
          content: `주제: ${topic.trim()}\n${
            category?.trim() ? `카테고리: ${category.trim()}\n` : ""
          }문제 개수: ${questionCount}개`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    choices: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 4,
                      maxItems: 4,
                    },
                    answerIndex: { type: "integer", minimum: 0, maximum: 3 },
                  },
                  required: ["question", "choices", "answerIndex"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("AI 응답이 비어 있습니다.");
    }

    const parsed = JSON.parse(raw) as { questions: GeneratedQuestion[] };

    const questions: Question[] = parsed.questions.map((q, index) => ({
      id: Date.now() + index,
      question: q.question,
      choices: q.choices,
      answerIndex: q.answerIndex,
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("AI 퀴즈 생성 실패:", error);
    return NextResponse.json(
      { error: "AI 퀴즈 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
