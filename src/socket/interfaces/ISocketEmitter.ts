import { Server } from 'socket.io';
import { IDType } from '../../repositories/interfaces/Repository.js';

export default interface ISocketEmitter {
  /**
   * Initialize with the Socket.IO server instance.
   */
  init(io: Server): void;

  /**
   * Emit an event to a specific user's room.
   */
  ToUser(userId: IDType, event: string, data: unknown): void;
}
