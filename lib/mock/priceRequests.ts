import type { PriceChangeRequest } from "@/lib/types";

export const PRICE_REQUESTS: PriceChangeRequest[] = [
  {
    id: "pcr_1",
    requestingOwnershipId: "ten_mla",
    courseVariantId: "lvl_chess_pp_1x",
    currentPrice: 139,
    requestedPrice: 149,
    reason: "Increased cost of materials and facility rent in Toronto.",
    status: "pending",
    submittedAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "pcr_2",
    requestingOwnershipId: "ten_mla",
    courseVariantId: "lvl_fin_basics_1x",
    currentPrice: 129,
    requestedPrice: 139,
    reason: "Align with regional market rates.",
    status: "approved",
    reviewedBy: "user_franchisor_admin",
    submittedAt: "2026-03-01T09:00:00Z",
    reviewedAt: "2026-03-05T14:00:00Z",
  },
  {
    id: "pcr_3",
    requestingOwnershipId: "ten_mla",
    courseVariantId: "lvl_math_g5_1x",
    currentPrice: 159,
    requestedPrice: 175,
    reason: "New curriculum resources required for Grade 5 Math.",
    status: "rejected",
    reviewedBy: "user_franchisor_admin",
    submittedAt: "2026-02-10T11:00:00Z",
    reviewedAt: "2026-02-14T16:30:00Z",
  },
  {
    id: "pcr_4",
    requestingOwnershipId: "ten_mla",
    courseVariantId: "lvl_fin_invest_1x",
    currentPrice: 169,
    requestedPrice: 179,
    reason: "Updated Finance Investment content with professional guest speakers.",
    status: "pending",
    submittedAt: "2026-04-28T08:00:00Z",
  },
];

export const PRICE_REQUEST_BY_ID: Record<string, PriceChangeRequest> = Object.fromEntries(
  PRICE_REQUESTS.map((r) => [r.id, r]),
);
