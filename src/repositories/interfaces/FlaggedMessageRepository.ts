import { FlaggedMessage, FlaggedMessageCreateInput } from '../../domain/flaggedMessage.entity.js';

export default interface IFlaggedMessageRepository {
  /**
   * Create a flagged message record
   */
  create(params: { flaggedMessage: FlaggedMessageCreateInput }): Promise<FlaggedMessage>;
}
