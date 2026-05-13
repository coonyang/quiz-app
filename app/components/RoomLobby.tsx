import { Room } from "../types/quiz";
import { useState } from "react";

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
  const [currentPage, setCurrentPage] = useState(1);

  const roomsPerPage = 5;

  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;

  const currentRooms = rooms.slice(startIndex, endIndex);
  const hasPages = totalPages > 0;
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

      <div className="mt-4 flex flex-col gap-3">
        {currentRooms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed text-center">
            <p className="text-lg font-semibold mt-5">방이 없습니다</p>

            <p className="mt-2 text-sm text-gray-500 p-5">
              새로운 방을 만들어보세요!
            </p>
          </div>
        ) : (
          currentRooms.map((room) => (
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
                    인원: {room.players.length} / {room.maxPlayers}
                  </p>
                </div>

                <button
                  onClick={() => onEnterRoom(room.id)}
                  disabled={
                    room.players.length >= room.maxPlayers ||
                    room.status !== "waiting"
                  }
                  className="whitespace-nowrap rounded-md border px-3 py-1 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {room.status !== "waiting"
                    ? "게임중"
                    : room.players.length >= room.maxPlayers
                      ? "가득참"
                      : "입장"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`rounded border px-3 py-1 ${
              currentPage === page ? "bg-emerald-300" : ""
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={!hasPages || currentPage === totalPages}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </section>
  );
}
