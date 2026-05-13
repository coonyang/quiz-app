import type { Room, ChatMessage } from "@/app/types/quiz";

export function updateStartRoomGame(room: Room): Room {
  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    nickname: "시스템",
    message: "게임이 시작되었습니다.",
    createdAt: new Date().toISOString(),
    playerId: "system",
  };

  return {
    ...room,
    status: "countdown",
    messages: [...room.messages, newMessage],
  };
}
