import { IDType } from '../../repositories/interfaces/Repository.js';

export default interface IPresenceService {
  /**
   * Check if user has any active sockets.
   */
  isOnline(userId: IDType): Promise<boolean>;

  /**
   * Handle user going offline — cleanup presence and notify partners.
   */
  handleUserOffline(params: {
    userId: IDType;
    reason: 'logout' | 'disconnect';
    socketId?: string;
  }): Promise<void>;
}
