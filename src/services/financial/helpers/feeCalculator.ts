import { FeeRule } from '../../../domain/financial/feeRule.entity.js';

/**
 * Calculate platform fee and worker amount from a total payment amount.
 *
 * Uses BigInt arithmetic to avoid floating-point precision issues.
 * platformFee = totalAmount * percentage / 100 (rounded down)
 * workerAmount = totalAmount - platformFee
 *
 * Invariant: workerAmount + platformFee === totalAmount
 *
 * @param totalAmount - Total payment amount in piasters
 * @param feeRule - Active fee rule with percentage
 * @returns workerAmount, platformFee, and feeRuleSnapshot
 */
export function calculateFee(
  totalAmount: bigint,
  feeRule: FeeRule,
): {
  workerAmount: bigint;
  platformFee: bigint;// an number like 250
  feeRuleSnapshot: Record<string, string | number | Date>;
} {
  const percentageBigInt = BigInt(feeRule.percentage);
  const platformFee = (totalAmount * percentageBigInt) / 10000n;
  const workerAmount = totalAmount - platformFee;

  if (workerAmount + platformFee !== totalAmount) {
    throw new Error(
      `Fee calculation invariant violated: workerAmount(${workerAmount}) + platformFee(${platformFee}) !== totalAmount(${totalAmount})`,
    );
  }

  const feeRuleSnapshot: Record<string, string | number | Date> = {
    rule_id: feeRule.id,
    percentage: feeRule.percentage,
    calculated_at: new Date().toISOString(),
  };

  return { workerAmount, platformFee, feeRuleSnapshot };
}
