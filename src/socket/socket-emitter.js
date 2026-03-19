import { logger } from '../libs/winston.js';

/** @type {import('socket.io').Server | undefined} */
let _io;

/**
 * @param {import('socket.io').Server} io
 */
export const initEmitter = (io) => {
  _io = io;
};

/**
 * @param {string} userId
 * @param {string} event
 * @param {unknown} data
 */
export const emitToUser = (userId, event, data) => {
  if (!_io) {
    logger.warn('[socket-emitter] emitToUser called before initEmitter');
    return;
  }
  _io.to(`user:${userId}`).emit(event, data);
};
