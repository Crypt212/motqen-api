import { IDType } from 'src/repositories/interfaces/Repository.js';
import { logger } from '../libs/winston.js';

let _io: import('socket.io').Server | undefined;

export const initEmitter = (io: import('socket.io').Server) => {
  _io = io;
};

export const emitToUser = (userId: IDType, event: string, data: unknown) => {
  if (!_io) {
    logger.warn('[socket-emitter] emitToUser called before initEmitter');
    return;
  }
  _io.to(`user:${userId}`).emit(event, data);
};
