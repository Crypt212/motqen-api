import { Session, SessionCreateInput, SessionFilter } from '../../domain/session.entity.js';
import { IDType } from './Repository.js';

export default interface ISessionRepository {
  /**
   * Find a session by user Id, deviceId and token
   */
  find(params: { filter: SessionFilter }): Promise<Session | null>;

  /**
   * Create a session
   */
  create(params: { userId: IDType; session: SessionCreateInput }): Promise<Session>;
  /**
   * Delete a session
   */
  delete(params: { filter: SessionFilter }): Promise<void>;
  /**
   * Delete all sessions with given filter: device Id, user Id
   */
  deleteMany(params: { filter: SessionFilter }): Promise<void>;
}
