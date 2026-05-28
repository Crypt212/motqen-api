import { WorkerBalance } from "src/domain/financial/workerBalance.entity.js";

export function computeAvailableToWithdraw(balance: WorkerBalance): bigint {
  return (
    balance.totalEarned -
    balance.withdrawn -
    balance.pendingWithdraw -
    balance.onHoldForDispute -
    balance.deductedForDebts
  );
}
