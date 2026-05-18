import type { ChatMessage, QuizSet, Room } from "./quiz";

export type RoomIdPayload = {
  roomId: string;
};

export type PlayerRoomPayload = {
  roomId: string;
  currentPlayerId: string;
};

export type EnterRoomPayload = PlayerRoomPayload & {
  nickname: string;
};

export type SendRoomMessagePayload = RoomIdPayload & {
  message: ChatMessage;
};

export type UpdateRoomQuizSetPayload = PlayerRoomPayload & {
  quizSet: QuizSet;
};

export type SubmitRoomAnswerPayload = RoomIdPayload & {
  playerId: string;
  choiceIndex: number;
  timeLeft: number;
};

export type CreateRoomPayload = Room;
