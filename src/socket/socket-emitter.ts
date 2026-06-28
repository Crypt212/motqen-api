import { IDType } from '../repositories/interfaces/Repository.js';
import { logger } from '../libs/winston.js';
import { Server } from 'socket.io';
import ISocketEmitter from './interfaces/ISocketEmitter.js';

class SocketEmitter implements ISocketEmitter {
  private io?: Server;

  init(io: Server): void {
    this.io = io;
  }

  ToUser(userId: IDType, event: string, data: unknown): void {
    if (!this.io) {
      logger.warn('[socket-emitter] emitToUser called before initEmitter');
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

export default new SocketEmitter();
