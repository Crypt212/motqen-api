import { Message } from '../domain/message.entity.js';
import { logger } from '../libs/winston.js';
import { detectContactInfo } from '../utils/contactDetection.js';
import IFlaggedMessageRepository from '../repositories/interfaces/FlaggedMessageRepository.js';

export default class ContactDetectionService {
  constructor(private flaggedMessageRepository: IFlaggedMessageRepository) {}
  /**
   * Analyzes a message for contact info and flags it silently if found.
   * This operates independently as a background task.
   */
  async analyzeAndFlagMessage(message: Message): Promise<void> {
    try {
      if (!message.content || message.type !== 'TEXT') return;

      const detectionMatches = detectContactInfo(message.content);
      if (detectionMatches.length > 0) {
        const reasons = Array.from(new Set(detectionMatches.map((m) => m.type)));
        const matchTexts = detectionMatches.map((m) => m.match);
        // Insert exactly one FlaggedMessage with multiple reasons
        await this.flaggedMessageRepository.create({
          flaggedMessage: {
            messageId: message.id,
            reasons: reasons,
            matches: matchTexts,
            state: 'PENDING',
          },
        });

        logger.info(`[ContactDetection] Flagged message ${message.id} for potentially sharing contact info.`);
      }
    } catch (error: unknown) {
      // Catch all errors tightly to ensure we never disrupt adjacent processes
      logger.error(`[ContactDetection] Failed to process message ${message.id}:`, error);
    }
  }
}
