import admin, { firebaseReady } from '../libs/firebase.js';
import { IFirebaseProvider, MulticastMessageOptions, TopicMessageOptions } from './interfaces/IFirebaseProvider.js';
import { BatchResponse } from 'firebase-admin/messaging';

export class FirebaseProvider implements IFirebaseProvider {
  isReady(): boolean {
    return firebaseReady;
  }

  async sendMulticast(options: MulticastMessageOptions): Promise<BatchResponse> {
    if (!this.isReady()) {
      throw new Error('Firebase is not initialized');
    }

    return await admin.messaging().sendEachForMulticast({
      tokens: options.tokens,
      notification: { title: options.title, body: options.body },
      data: options.data,
    });
  }

  async sendTopic(options: TopicMessageOptions): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Firebase is not initialized');
    }

    await admin.messaging().send({
      topic: options.topic,
      notification: { title: options.title, body: options.body },
      data: options.data,
    });
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Firebase is not initialized');
    }
    await admin.messaging().subscribeToTopic(tokens, topic);
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Firebase is not initialized');
    }
    await admin.messaging().unsubscribeFromTopic(tokens, topic);
  }
}
