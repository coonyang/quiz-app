import { Room } from "../types/quiz";
type RoomLobbyProps = {
  rooms: Room[];
  onEnterRoom: (roomId: string) => void;
  onOpenCreateRoomModal: () => void;
};

export default function RoomLobby({
  onEnterRoom,
  rooms,
  onOpenCreateRoomModal,
}: RoomLobbyProps) {
  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">온라인 방</h1>

        <button
          onClick={onOpenCreateRoomModal}
          className="rounded-md border px-4 py-2 hover:bg-emerald-300"
        >
          방 만들기
        </button>
      </div>

      <div className="grid gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{room.title}</h2>

                <p className="mt-1 text-sm text-gray-500">
                  문제집: {room.quizSetTitle}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  방장: {room.hostNickname}
                </p>

                <p className="mt-2 text-sm font-medium">
                  인원: {room.currentPlayers} / {room.maxPlayers}
                </p>
              </div>

              <button
                onClick={() => onEnterRoom(room.id)}
                disabled={room.currentPlayers >= room.maxPlayers}
                className="whitespace-nowrap rounded-md border px-3 py-1 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {room.currentPlayers >= room.maxPlayers ? "가득참" : "입장"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
