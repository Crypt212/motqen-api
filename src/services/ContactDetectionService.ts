import { Message } from '../domain/message.entity.js';
import { logger } from '../libs/winston.js';
import { detectContactInfo } from '../utils/contactDetection.js';
import IFlaggedMessageRepository from '../repositories/interfaces/FlaggedMessageRepository.js';
import AppError from '../errors/AppError.js';

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

        logger.info(
          `[ContactDetection] Flagged message ${message.id} for potentially sharing contact info.`
        );
      }
    } catch (error: unknown) {
      // Catch all errors tightly to ensure we never disrupt adjacent processes
      logger.error(`[ContactDetection] Failed to process message ${message.id}:`, error);
    }
  }

  /**
   * Scans generic fields (like bio, profile notes, or order descriptions) for contact info.
   * [Point 6 in S1.2] - Flag any field that could indirectly reveal contact info.
   * 
   * @param entityType - The type of entity being scanned (e.g., 'WorkerProfile', 'Order')
   * @param entityId - The ID of the entity (user ID or profile ID)
   * @param fieldsToScan - A record of field names and their string values
   * @param blockAction - If true, throws an AppError to prevent saving the data
   */
  scanAndFlagFields(
    entityType: string,
    entityId: string,
    fieldsToScan: Record<string, string | null | undefined>,
    blockAction: boolean = true
  ): void {
    for (const [fieldName, text] of Object.entries(fieldsToScan)) {
      if (!text) continue;

      const detectionMatches = detectContactInfo(text);
      
      if (detectionMatches.length > 0) {
        const matches = detectionMatches.map((m) => m.match).join(', ');
        
        // 1. Flagging in System Logs (Monitoring)
        logger.warn(
          `[Security Flag] Indirect contact info detected in ${entityType} (${entityId}) - Field: ${fieldName}. Matches: ${matches}`
        );

        // 2. Active Blocking (Optional but recommended for Profile Bios)
        if (blockAction) {
          throw new AppError(`Sharing contact information in ${fieldName} is not allowed.`, 400);
        }
      }
    }
  }
}