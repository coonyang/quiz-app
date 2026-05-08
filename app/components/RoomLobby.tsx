type Room = {
  id: string;
  title: string;
  quizSetTitle: string;
  currentPlayers: number;
  maxPlayers: number;
};

const mockRooms: Room[] = [
  {
    id: "room-1",
    title: "수학 빠른방",
    quizSetTitle: "수학 기초",
    currentPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "room-2",
    title: "개발용어 ㄱㄱ",
    quizSetTitle: "개발용어 기초",
    currentPlayers: 1,
    maxPlayers: 4,
  },
];
export default function RoomLobby() {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">온라인 방</h1>

        <button className="rounded-md border px-4 py-2 hover:bg-emerald-300">
          방 만들기
        </button>
      </div>

      <div className="grid gap-3">
        {mockRooms.map((room) => (
          <div key={room.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{room.title}</h2>
                <p className="text-sm text-gray-500">{room.quizSetTitle}</p>
                <p className="text-sm">
                  {room.currentPlayers} / {room.maxPlayers}
                </p>
              </div>

              <button className="rounded-md border px-3 py-1 hover:bg-gray-100">
                입장
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
