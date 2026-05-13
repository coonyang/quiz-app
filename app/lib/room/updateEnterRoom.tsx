import type { Room, ChatMessage } from "@/app/types/quiz";

export function updateEnterRoom(
  room: Room,
  currentPlayerId: string,
  nickname: string,
): Room {
  if (room.status !== "waiting") {
    return room;
  }

  const alreadyJoined = room.players.some(
    (player) => player.id === currentPlayerId,
  );

  if (alreadyJoined) {
    return room;
  }

  if (room.players.length >= room.maxPlayers) {
    return room;
  }

  const playerNickname = nickname.trim() || "익명";

  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    nickname: "시스템",
    message: `${playerNickname}님이 입장했습니다`,
    createdAt: new Date().toISOString(),
    playerId: "system",
  };

  return {
    ...room,
    messages: [...room.messages, newMessage],

    players: [
      ...room.players,
      {
        id: currentPlayerId,
        nickname: playerNickname,
        isHost: false,
        score: 0,
      },
    ],
  };
}
