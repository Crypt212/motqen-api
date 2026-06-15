import { PrismaClient } from '../../generated/prisma/client.js';
import IDisputeRepository from '../../repositories/interfaces/financial/DisputeRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import { EscrowService } from './EscrowService.js';
import { logActivity } from './helpers/activityLogger.js';
import { DisputeResolution, DisputeStatus } from '../../domain/financial/dispute.entity.js';

export class DisputeService {
  constructor(
    private readonly disputeRepo: IDisputeRepository,
    private readonly transactionLogRepo: ITransactionLogRepository,
    private readonly escrowService: EscrowService,
    private readonly prisma: PrismaClient
  ) {}

  async openDispute(data: {
    orderId: string;
    openedBy: string;
    evidence?: unknown[];
    flaggedMessageIds?: string[];
    eventTimeline?: unknown[];
  }) {
    // Verify order exists
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new Error('Order not found');

    // Check for existing open dispute
    const existing = await this.disputeRepo.findByOrderId(data.orderId);
    if (existing && ['OPEN', 'AWAITING_INFO'].includes(existing.status)) {
      throw new Error('An open dispute already exists for this order');
    }

    const dispute = await this.disputeRepo.create(data);

    await logActivity(this.prisma, {
      actorId: data.openedBy,
      actionType: 'DISPUTE_OPENED',
      entityType: 'Dispute',
      entityId: dispute.id,
      metadata: { orderId: data.orderId },
    });

    return dispute;
  }

  async getDispute(disputeId: string) {
    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    // Get linked transaction logs
    const transactionLogs = dispute.linkedTransactionLogIds.length > 0
      ? await Promise.all(
          dispute.linkedTransactionLogIds.map(id =>
            this.transactionLogRepo.findByReference(id, 'DISPUTE')
          )
        )
      : [];

    // Get messages
    const messages = await this.disputeRepo.getMessages(disputeId);

    return {
      ...dispute,
      transactionLogs: transactionLogs.flat(),
      messages,
    };
  }

  async listDisputes(filters?: { status?: DisputeStatus; orderId?: string }, limit = 20, offset = 0) {
    return this.disputeRepo.findAll(filters, limit, offset);
  }

  /**
   * Admin requests more info from the user.
   * Sends a notification and changes status to AWAITING_INFO.
   */
  async requestMoreInfo(disputeId: string, adminId: string, message: string) {
    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    if (!['OPEN', 'AWAITING_INFO'].includes(dispute.status)) {
      throw new Error(`Cannot request info on dispute in status ${dispute.status}`);
    }

    await this.disputeRepo.updateStatus(disputeId, 'AWAITING_INFO');
    await this.disputeRepo.addMessage(disputeId, adminId, message);

    await logActivity(this.prisma, {
      actorId: adminId,
      actionType: 'DISPUTE_INFO_REQUESTED',
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: { message },
    });

    // TODO: trigger notification to the user who opened the dispute

    return { status: 'AWAITING_INFO' };
  }

  /**
   * Admin resolves a dispute with a decision and reason.
   */
  async resolveDispute(disputeId: string, adminId: string, resolution: DisputeResolution, reason: string) {
    if (!resolution) throw new Error('Resolution is required');
    if (!reason) throw new Error('Reason is required');

    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    if (['RESOLVED', 'DISMISSED'].includes(dispute.status)) {
      throw new Error(`Dispute already ${dispute.status.toLowerCase()}`);
    }

    const updatedDispute = await this.disputeRepo.updateStatus(disputeId, 'RESOLVED', {
      resolution,
      resolutionNote: reason,
      resolvedBy: adminId,
      resolvedAt: new Date(),
    });

    // Handle financial effects based on resolution
    if (resolution === 'REFUND_CLIENT') {
      await this.escrowService.resolveDisputeAgainstWorker(dispute.orderId, adminId);
    } else if (resolution === 'FAVOR_WORKER' || resolution === 'NO_ACTION') {
      // Release any dispute holds back to the worker
      try {
        await this.escrowService.releaseDisputeHold(dispute.orderId);
      } catch (e) {
        // Might not have a hold, that's okay
        console.warn(`No dispute hold to release for order ${dispute.orderId}:`, e);
      }
    }

    await logActivity(this.prisma, {
      actorId: adminId,
      actionType: 'DISPUTE_RESOLVED',
      entityType: 'Dispute',
      entityId: disputeId,
      metadata: { resolution, reason, orderId: dispute.orderId },
    });

    return updatedDispute;
  }

  async addMessage(disputeId: string, senderId: string, content: string) {
    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    return this.disputeRepo.addMessage(disputeId, senderId, content);
  }

  async getMessages(disputeId: string) {
    return this.disputeRepo.getMessages(disputeId);
  }

  async updateStatus(disputeId: string, status: string) {
    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    const statusMap: Record<string, DisputeStatus> = {
      Open: 'OPEN',
      OPEN: 'OPEN',
      'Under Review': 'AWAITING_INFO',
      AWAITING_INFO: 'AWAITING_INFO',
      Resolved: 'RESOLVED',
      RESOLVED: 'RESOLVED',
      Closed: 'DISMISSED',
      DISMISSED: 'DISMISSED',
    };

    const mappedStatus = statusMap[status];
    if (!mappedStatus) throw new Error(`Invalid dispute status: ${status}`);

    if (['RESOLVED', 'DISMISSED'].includes(dispute.status)) {
      throw new Error(`Cannot update dispute in status ${dispute.status}`);
    }

    const updated = await this.disputeRepo.updateStatus(disputeId, mappedStatus);
    return { id: updated.id, status };
  }
}
