type RoomScreenProps = {
  roomId: string;
  nickname: string;
  onLeaveRoom: () => void;
};

const mockPlayers = [
  { id: "player-1", nickname: "관리자", score: 0, isHost: true },
  { id: "player-2", nickname: "게스트", score: 0, isHost: false },
];

const mockMessages = [
  { id: "message-1", nickname: "관리자", message: "시작할까요?" },
  { id: "message-2", nickname: "게스트", message: "ㄱㄱ" },
];

export default function RoomScreen({
  roomId,
  nickname,
  onLeaveRoom,
}: RoomScreenProps) {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">{roomId}</p>
              <h1 className="text-2xl font-bold">수학 빠른방</h1>
            </div>

            <button
              onClick={onLeaveRoom}
              className="rounded-md border px-4 py-2 hover:bg-gray-100"
            >
              나가기
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="mb-3 text-lg font-semibold">참가자</h2>

          <div className="grid gap-2">
            {mockPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">
                    {player.nickname}
                    {player.nickname === nickname ? " (나)" : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {player.isHost ? "방장" : "참가자"}
                  </p>
                </div>

                <p className="font-semibold">{player.score}점</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="mb-3 text-lg font-semibold">게임</h2>
          <p className="text-sm text-gray-500">
            아직 게임이 시작되지 않았습니다.
          </p>

          <button className="mt-4 w-full rounded-md border px-5 py-3 hover:bg-emerald-300">
            게임 시작
          </button>
        </div>
      </div>

      <aside className="flex min-h-[520px] flex-col rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-semibold">채팅</h2>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-3">
          {mockMessages.map((message) => (
            <div key={message.id}>
              <p className="text-sm font-semibold">{message.nickname}</p>
              <p className="text-sm">{message.message}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            placeholder="메시지 입력"
            className="min-w-0 flex-1 rounded-md border px-3 py-2"
          />
          <button className="rounded-md border px-3 py-2 hover:bg-gray-100">
            전송
          </button>
        </div>
      </aside>
    </section>
  );
}
