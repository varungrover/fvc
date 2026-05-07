import { DiscountTier, InvoiceLineItem } from "../types";

/**
 * Computes prorated amount for the remainder of the current month.
 * If enrollment is on the 1st, returns the full price.
 */
export function computeFirstMonthAmount(price: number, enrollmentDate: Date): number {
  const daysInMonth = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - enrollmentDate.getDate() + 1;
  
  if (remainingDays === daysInMonth) return price;
  
  const dailyRate = price / daysInMonth;
  const prorated = dailyRate * remainingDays;
  
  return parseFloat(prorated.toFixed(2));
}

/**
 * Computes the multi-planet discount amount based on active tiers.
 */
export function computeMultiPlanetDiscount(
  subtotal: number,
  activePlanetCount: number,
  tiers: DiscountTier[]
): number {
  const tier = tiers.find(t => t.planetsCount === activePlanetCount && t.isActive);
  if (!tier) return 0;
  
  const discountAmount = (subtotal * tier.discountPct) / 100;
  return parseFloat(discountAmount.toFixed(2));
}

/**
 * Builds invoice line items for a new enrollment.
 */
export function buildInvoiceLineItems(params: {
  enrollmentId: string;
  description: string;
  amount: number;
  setupFee?: number;
  discountPct?: number;
}): Partial<InvoiceLineItem>[] {
  const items: Partial<InvoiceLineItem>[] = [];
  
  // 1. Enrollment Line
  let discountAmount = 0;
  if (params.discountPct) {
    discountAmount = parseFloat(((params.amount * params.discountPct) / 100).toFixed(2));
  }

  items.push({
    enrollment_id: params.enrollmentId,
    description: params.description,
    amount: params.amount,
    discount_amount: discountAmount,
    reference_type: "enrollment",
  });

  // 2. Setup Fee Line
  if (params.setupFee) {
    items.push({
      description: `Setup Fee - ${params.description}`,
      amount: params.setupFee,
      discount_amount: 0,
      reference_type: "setup_fee",
    });
  }

  return items;
}
