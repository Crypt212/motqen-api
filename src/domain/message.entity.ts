import { $Enums } from '@prisma/client';
import { IDType } from '../repositories/interfaces/Repository.js';

export type MessageType = $Enums.MessageType;
export type Message = {
  id: IDType;
  conversationId: IDType;
  senderId: IDType;
  messageNumber: number;
  content: string;
  type: MessageType,
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: IDType;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
};

export type MessageCreateInput = {
  conversationId: IDType;
  senderId: IDType;
  messageNumber: number;
  content: string;
  type?: MessageType,
};

export type MessageFilter = {
  id?: IDType;
  conversationId?: IDType;
  senderId?: IDType;
  messageNumber?: number;
  type?: MessageType,
};
