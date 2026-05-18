import { $Enums } from '../generated/prisma/client.js';

type ProblemCategory = $Enums.ProblemCategory;
type ProblemType = $Enums.ProblemType;

export const CATEGORY_TYPE_MAP: Record<ProblemCategory, readonly ProblemType[]> = {
  ORDER_ISSUE: [
    $Enums.ProblemType.UNFINISHED_WORK,
    $Enums.ProblemType.PAYMENT_DISPUTE,
    $Enums.ProblemType.NO_SHOW,
    $Enums.ProblemType.PROPERTY_DAMAGE,
    $Enums.ProblemType.OTHER,
  ],
  WORKER_CONDUCT: [
    $Enums.ProblemType.HARASSMENT,
    $Enums.ProblemType.UNPROFESSIONAL_BEHAVIOR,
    $Enums.ProblemType.FRAUD,
    $Enums.ProblemType.OTHER,
  ],
  CLIENT_CONDUCT: [
    $Enums.ProblemType.HARASSMENT,
    $Enums.ProblemType.PAYMENT_FRAUD,
    $Enums.ProblemType.UNREASONABLE_DEMANDS,
    $Enums.ProblemType.OTHER,
  ],
  CHAT_MESSAGE: [
    $Enums.ProblemType.SPAM,
    $Enums.ProblemType.INAPPROPRIATE_CONTENT,
    $Enums.ProblemType.HARASSMENT,
    $Enums.ProblemType.OTHER,
  ],
  OTHER: [$Enums.ProblemType.OTHER],
} as const;

export function isValidCategoryTypePair(category: ProblemCategory, type: ProblemType): boolean {
  return CATEGORY_TYPE_MAP[category].includes(type);
}

export function getAllowedTypes(category: ProblemCategory): readonly ProblemType[] {
  return CATEGORY_TYPE_MAP[category];
}
