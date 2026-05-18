import type { Room } from "@/app/types/quiz";

export function updateCountdownEnd(room: Room): Room {
  if (room.status !== "countdown") {
    return room;
  }
  return {
    ...room,
    status: "playing",
    questionStartedAt: Date.now(),
  };
}
