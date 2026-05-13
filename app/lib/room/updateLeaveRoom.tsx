import type { Room, ChatMessage } from "@/app/types/quiz";

export function updateLeaveRoom(room: Room, currentPlayerId: string): Room {
  const leavingPlayer = room.players.find(
    (player) => player.id === currentPlayerId,
  );

  const nextPlayers = room.players.filter(
    (player) => player.id !== currentPlayerId,
  );

  const leaveMessage: ChatMessage = {
    id: crypto.randomUUID(),
    nickname: "시스템",
    message: `${leavingPlayer?.nickname}님이 퇴장했습니다`,
    createdAt: new Date().toISOString(),
    playerId: "system",
  };

  const nextMessages = [...room.messages, leaveMessage];

  if (leavingPlayer?.isHost && nextPlayers.length > 0) {
    nextPlayers[0].isHost = true;

    const hostMessage: ChatMessage = {
      id: crypto.randomUUID(),
      nickname: "시스템",
      message: `${nextPlayers[0].nickname}님이 방장이 되었습니다.`,
      createdAt: new Date().toISOString(),
      playerId: "system",
    };

    nextMessages.push(hostMessage);
  }

  return {
    ...room,
    players: nextPlayers,
    messages: nextMessages,
  };
}
