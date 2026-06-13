import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FieldTypeDefinition } from '../types/query.js';

import { User } from './user.entity.js';

export type MessageType = $Enums.MessageType;
export type Message = {
  id: IDType;
  conversationId: IDType;
  senderId: IDType;
  messageNumber: number;
  content: string;
  type: MessageType;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
};

export type MessageCreateInput = {
  conversationId: IDType;
  senderId: IDType;
  messageNumber: number;
  content: string;
  type?: MessageType;
};

export type MessageFilter = Partial<{
  id: IDType;
  conversationId: IDType;
  senderId: IDType;
  messageNumber: number;
  type: MessageType;
}>;
