import { WorkerBalance, computeAvailableToWithdraw } from '../../../domain/financial/workerBalance.entity.js';
import AppError from '../../../errors/AppError.js';

/**
 * Assert the balance invariant: available_to_withdraw >= 0.
 * Called before every WorkerBalance mutation to prevent overdrafts.
 *
 * @param balance - Current WorkerBalance record
 * @param context - Operation name for error messages (e.g., "withdrawal creation")
 * @param allowNegative - If true, skip the invariant check (used by post-release refund debt flow)
 * @throws AppError 500 if invariant is violated and allowNegative is false
 */
export function assertBalanceInvariant(
  balance: WorkerBalance,
  context: string,
  allowNegative = false,
): void {
  if (allowNegative) return;

  const available = computeAvailableToWithdraw(balance);

  if (available < 0n) {
    throw new AppError(
      `Balance invariant violated during ${context}: ` +
      `total_earned=${balance.totalEarned}, withdrawn=${balance.withdrawn}, ` +
      `pending_withdraw=${balance.pendingWithdraw}, ` +
      `on_hold_for_dispute=${balance.onHoldForDispute}, ` +
      `computed_available=${available}`,
      500,
    );
  }
}
