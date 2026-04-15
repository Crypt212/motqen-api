/**
 * @fileoverview Presence Service - Handle user online/offline state and cleanup
 * @module services/PresenceService
 */

import Service from './Service.js';
import IChatPresenceCache from '../cache/interfaces/ChatPresenceCache.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { emitToUser } from '../socket/socket-emitter.js';
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
    const { userId, reason, socketId } = params;

    try {
      // Get user's conversations to cleanup and notify partners
      const convs =
        await this.conversationRepository.findNonEmptyConversationsWithParticipantsAndMessages({
          userId,
          filter: {},
        });
      const conversationIds = convs.conversationParticipantsWithMessages.map((c) => c.id);

      // Remove all presence data from Redis
      await this.presenceCache.removeAllSockets({ userId });
      await this.presenceCache.removeAllInChat({ userId, conversationIds });

      // Update DB status to offline
      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false },
      });

      // Notify all unique partners that user is offline
      const partnersEmitted = new Set<string>();
      for (const conv of convs.conversationParticipantsWithMessages) {
        const partner = conv.participants.find((p) => p.userId !== userId);
        if (partner && !partnersEmitted.has(partner.userId)) {
          emitToUser(partner.userId, 'user_offline', { userId });
          partnersEmitted.add(partner.userId);
        }
      }

      // If logout, tell client to disconnect their socket
      if (reason === 'logout') {
        emitToUser(userId, 'force_logout', { reason: 'logged_out' });
      }

      logger.info(`[presence] user ${userId} is now offline (${reason})`);
    } catch (err) {
      logger.error('[presence] handleUserOffline error:', err);
      throw err;
    }
  }

  /**
   * Handle single socket disconnect - only does full cleanup if no more sockets remain.
   * This should be called on socket disconnect event.
   */
  async handleSocketDisconnect(params: { userId: IDType; socketId: string }): Promise<void> {
    const { userId, socketId } = params;

    try {
      // Remove this socket from online set
      await this.presenceCache.removeSocket({ userId, socketId });

      // Get conversations for this user
      const convs =
        await this.conversationRepository.findNonEmptyConversationsWithParticipantsAndMessages({
          userId,
          filter: {},
          pagination: { page: 1, limit: 100 },
        });
      const conversationIds = convs.conversationParticipantsWithMessages.map((c) => c.id);

      // Remove socket from all inChat sets
      await this.presenceCache.leaveAllChats({ userId, socketId, conversationIds });

      // Emit partner_offline to online partners for each conversation
      for (const conv of convs.conversationParticipantsWithMessages) {
        const partner = conv.participants.find((p) => p.userId !== userId);
        if (!partner) continue;

        const isPartnerOnline = await this.presenceCache.isOnline({ userId: partner.userId });
        if (isPartnerOnline) {
          emitToUser(partner.userId, 'partner_offline', { conversationId: conv.id });
        }
      }

      // Check if all devices are now offline
      const remaining = await this.presenceCache.countSockets({ userId });

      if (remaining === 0) {
        // Do full cleanup
        await this.handleUserOffline({ userId, reason: 'disconnect' });
      }
    } catch (err) {
      logger.error('[presence] handleSocketDisconnect error:', err);
      throw err;
    }
  }
}
