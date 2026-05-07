import { SupabaseClient } from "@supabase/supabase-js";
import { Invoice, InvoiceStatus, InvoiceLineItem } from "../types";

export async function listInvoices(
  supabase: SupabaseClient,
  filters: { customerId?: string; ownershipId?: string; status?: InvoiceStatus }
) {
  let query = supabase
    .from("invoices")
    .select("*, profiles!customer_id(full_name)");

  if (filters.customerId) query = query.eq("customer_id", filters.customerId);
  if (filters.ownershipId) query = query.eq("ownership_id", filters.ownershipId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("issued_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInvoice(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, profiles!customer_id(full_name), invoice_line_items(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createInvoice(
  supabase: SupabaseClient,
  input: {
    customerId: string;
    ownershipId: string;
    amount: number;
    discount?: number;
    tax?: number;
    total: number;
    dueDate: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    lineItems: Partial<InvoiceLineItem>[];
  }
) {
  // 1. Create Invoice
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      customer_id: input.customerId,
      ownership_id: input.ownershipId,
      amount: input.amount,
      discount: input.discount || 0,
      tax: input.tax || 0,
      total: input.total,
      due_date: input.dueDate,
      billing_period_start: input.billingPeriodStart,
      billing_period_end: input.billingPeriodEnd,
      status: "pending",
    })
    .select()
    .single();

  if (invError) throw invError;

  // 2. Create Line Items
  const items = input.lineItems.map(item => ({
    ...item,
    invoice_id: invoice.id
  }));

  const { error: itemError } = await supabase
    .from("invoice_line_items")
    .insert(items);

  if (itemError) throw itemError;

  return invoice;
}

export async function updateInvoiceStatus(
  supabase: SupabaseClient,
  id: string,
  status: InvoiceStatus,
  stripePiId?: string,
  paidAt?: string
) {
  const { data, error } = await supabase
    .from("invoices")
    .update({
      status,
      stripe_pi_id: stripePiId,
      paid_at: paidAt,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
