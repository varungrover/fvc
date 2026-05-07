import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createEnrollment, listEnrollments } from "@/lib/db/enrollments";
import { createInvoice } from "@/lib/db/invoices";
import { computeFirstMonthAmount, buildInvoiceLineItems } from "@/lib/billing/invoice";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const memberId = searchParams.get("memberId");
  const status = searchParams.get("status") as any;

  try {
    const enrollments = await listEnrollments(supabase, {
      customerId: customerId || undefined,
      memberId: memberId || undefined,
      status,
    });
    return NextResponse.json(enrollments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const {
    memberId,
    customerId,
    productVariantId,
    locationId,
    ownershipId,
    offeringPrice,
    batchIds,
    description,
    setupFee = 0,
  } = body;

  try {
    // 1. Create Enrollment and Batches
    const enrollment = await createEnrollment(supabase, {
      memberId,
      customerId,
      productVariantId,
      locationId,
      ownershipId,
      offeringPrice,
      batchIds,
    });

    // 2. Compute Billing Details
    const now = new Date();
    const firstMonthAmount = computeFirstMonthAmount(offeringPrice, now);
    
    // billing period is current month
    const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const dueDate = now.toISOString().split("T")[0]; // Due immediately

    // 3. Build Line Items
    const lineItems = buildInvoiceLineItems({
      enrollmentId: enrollment.id,
      description: description || "Monthly Enrollment",
      amount: firstMonthAmount,
      setupFee: setupFee,
    });

    const total = firstMonthAmount + setupFee;

    // 4. Create Initial Invoice
    const invoice = await createInvoice(supabase, {
      customerId,
      ownershipId,
      amount: firstMonthAmount + setupFee,
      total: total,
      dueDate,
      billingPeriodStart,
      billingPeriodEnd,
      lineItems,
    });

    return NextResponse.json({ enrollment, invoice }, { status: 201 });
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
