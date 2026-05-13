import type { Room } from "@/app/types/quiz";

export function updateCountdownEnd(room: Room): Room {
  return {
    ...room,
    status: "playing",
    questionStartedAt: Date.now(),
  };
}
