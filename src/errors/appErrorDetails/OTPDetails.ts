import { AppErrorDetails } from '../AppError.js';

type FailedAttempt = {
  type: 'FAILED_ATTEMPT';
  remainingAttempts?: number;
  requestNewOtp?: boolean;
};
type TooManyVerificationRequests = { type: 'TOO_MANY_VERIFICATION_REQUESTS'; retryAfter: number };

export class OTPErrorDetails implements AppErrorDetails {
  constructor(public readonly details: FailedAttempt | TooManyVerificationRequests) {}
  toJSON(): FailedAttempt | TooManyVerificationRequests {
    return this.details;
  }
}
