import type { FlawSeverity } from "@/lib/types";

/** One source of truth for the current Budget weakness payout. */
export const BUDGET_REFUND_BY_SEVERITY: Readonly<Record<FlawSeverity, 1 | 2 | 3>> = {
  Mild: 1,
  Bad: 2,
  Brutal: 3,
  "Career-Threatening": 3,
};

export function budgetRefundForSeverity(severity: FlawSeverity): 1 | 2 | 3 {
  return BUDGET_REFUND_BY_SEVERITY[severity];
}
