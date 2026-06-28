/**
 * @fileoverview Presence Service - Manage user online/offline state and cleanup
 * @module services/PresenceService
 */

import Service from './Service.js';
import IChatPresenceCache from '../cache/interfaces/ChatPresenceCache.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import emitter from '../socket/socket-emitter.js';
import { logger } from '../libs/winston.js';
import { PrismaClient } from '../generated/prisma/client.js';
import ConversationRepository from '../repositories/prisma/ConversationRepository.js';

/**
 * Presence Service - Manages user presence state and cleanup
 * @class
 * @extends Service
 */
export default class PresenceService extends Service {
  private presenceCache: IChatPresenceCache;
  private conversationRepository: ConversationRepository;
  private prisma: PrismaClient;

  constructor(params: {
    presenceCache: IChatPresenceCache;
    conversationRepository: ConversationRepository;
    prisma: PrismaClient;
  }) {
    super();
    this.presenceCache = params.presenceCache;
    this.conversationRepository = params.conversationRepository;
    this.prisma = params.prisma;
  }

  /**
   * Check if user has any active sockets
   */
  async isOnline(userId: IDType): Promise<boolean> {
    return this.presenceCache.isOnline({ userId });
  }

  /**
   * Handle user going offline - cleanup presence and notify partners.
   * This should be called on both logout and last socket disconnect.
   * @param params.reason - 'logout' | 'disconnect' to determine if we should emit force_logout
   */
  async handleUserOffline(params: {
    userId: IDType;
    reason: 'logout' | 'disconnect';
    socketId?: string;
  }): Promise<void> {
    const { userId, reason } = params;

    try {
      // Remove all presence data from Redis
      await this.presenceCache.removeSocket({ userId });
      await this.presenceCache.removeFromAllEnterSets({ userId });

      // Update DB status to offline
      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false },
      });

      // If logout, tell client to disconnect their socket
      if (reason === 'logout') {
        emitter.ToUser(userId, 'force_logout', { reason: 'logged_out' });
      }

      logger.info(`[presence] user ${userId} is now offline (${reason})`);
    } catch (err) {
      logger.error('[presence] handleUserOffline error:', err);
      throw err;
    }
  }
}
