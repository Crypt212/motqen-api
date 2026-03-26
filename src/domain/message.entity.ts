import { $Enums } from '@prisma/client';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FieldTypeDefinition } from 'src/types/query.js';
import { FilterFromDescriptor } from 'src/schemas/common.js';

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
  type?: MessageType;
};

export const MessageFilterDescriptor = {
  id: { type: 'uuid' as const },
  conversationId: { type: 'uuid' as const },
  senderId: { type: 'uuid' as const },
  messageNumber: { type: 'number' as const },
  type: { type: 'enum', enumValues: ['TEXT', 'IMAGE'] as const },
} satisfies Record<string, FieldTypeDefinition>;

export type MessageFilter = FilterFromDescriptor<typeof MessageFilterDescriptor>;
