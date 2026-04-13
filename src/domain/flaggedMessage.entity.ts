import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';

export type FlagReasonType = $Enums.FlagReasonType;
export type FlagState = $Enums.FlagState;

export type FlaggedMessage = {
  id: IDType;
  messageId: IDType;
  reasons: FlagReasonType[];
  matches: string[];
  state: FlagState;
  createdAt: Date;
  updatedAt: Date;
};

export type FlaggedMessageCreateInput = {
  messageId: IDType;
  reasons: FlagReasonType[];
  matches: string[];
  state?: FlagState;
};
