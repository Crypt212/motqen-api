import { BatchResponse } from 'firebase-admin/messaging';

export interface MulticastMessageOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface TopicMessageOptions {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface IFirebaseProvider {
  isReady(): boolean;
  sendMulticast(options: MulticastMessageOptions): Promise<BatchResponse>;
  sendTopic(options: TopicMessageOptions): Promise<void>;
}
