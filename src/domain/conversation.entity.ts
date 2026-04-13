import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { User } from './user.entity.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';

export type ConversationRole = $Enums.ConversationRole;

export type Conversation = {
  id: IDType;
  messageCounter: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationCreateInput = {
  workerId: IDType;
  clientId: IDType;
};

export type ConversationUpdateInput = {
  messageCounter?: number;
  workerId?: IDType;
  clientId?: IDType;
};

export const ConversationFilterDescriptor = {
  id: { type: 'uuid' as const },
  workerId: { type: 'uuid' as const },
  clientId: { type: 'uuid' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type ConversationFilter = FilterFromDescriptor<typeof ConversationFilterDescriptor>;

// ==================================================

export type ConversationParticipant = {
  id: IDType;
  conversationId: IDType;
  userId: IDType;
  role: ConversationRole;
  lastReadMessageNumber: number;
  lastReceivedMessageNumber: number;
  createdAt: Date;
  updatedAt: Date;
  user?: Omit<Omit<User, 'createdAt'>, 'updatedAt'>;
};

export type ConversationWithParticipantsAndMessages = Conversation & {
  // unreadCount: number;
  participants: ConversationParticipant[];
  messages?: Message[];
};

export type Message = {
  id: IDType;
  conversationId: IDType;
  senderId: IDType;
  messageNumber: number;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};
