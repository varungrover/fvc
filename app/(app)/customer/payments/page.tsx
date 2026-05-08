"use client";

import { useState } from "react";
import { Plus, CreditCard, AlertTriangle, Lock, Download, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP } from "@/lib/theme/tokens";
import { INVOICES_BY_CUSTOMER, PAYMENT_METHODS, INVOICE_LINE_ITEMS } from "@/lib/mock/invoices";
import type { Invoice } from "@/lib/types";
import type { ReactNode } from "react";

const CUSTOMER_ID = "cust_raj";

const CARD_ICONS: Record<string, ReactNode> = {
  visa: <CreditCard size={22} />,
  mastercard: <CreditCard size={22} />,
  amex: <CreditCard size={22} />,
  discover: <CreditCard size={22} />,
  other: <CreditCard size={22} />,
};

function fmtCardBrand(brand: string) {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function fmtMonth(m: number) {
  return String(m).padStart(2, "0");
}

function fmtInvoiceDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtInvoicePeriod(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

export default function PaymentsPage() {
  const cards = PAYMENT_METHODS.filter((p) => p.customerId === CUSTOMER_ID);
  const invoices = [...(INVOICES_BY_CUSTOMER[CUSTOMER_ID] ?? [])].reverse();

  const [showAddCard, setShowAddCard] = useState(false);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const failedCount = invoices.filter((inv) => inv.status === "failed").length;

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Billing & Payments"
        subtitle="CAD · GST included · Charged on the 1st of each month"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAddCard(true)} icon={<Plus size={14} strokeWidth={2.5} />}>
            Add Payment Method
          </Button>
        }
      />

      {/* Alert: failed payment */}
      {failedCount > 0 && (
        <div
          style={{
            background: TLP.redLight,
            border: `1px solid ${TLP.red}`,
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          <span style={{ display: "flex", color: TLP.red }}>
            <AlertTriangle size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: TLP.red }}>
              {failedCount} failed payment{failedCount > 1 ? "s" : ""}
            </span>
            <span style={{ color: TLP.gray700 }}>
              {" "}— please update your payment method to avoid service interruption.
            </span>
          </div>
          <Button variant="danger" size="sm">
            Retry Now
          </Button>
        </div>
      )}

      {/* Cards on file */}
      <Card style={{ padding: "18px 20px", marginBottom: 20 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 12,
          }}
        >
          Payment Methods
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 9,
                border: `1.5px solid ${card.isDefault ? TLP.teal : TLP.gray200}`,
                background: card.isDefault ? TLP.tealLight : TLP.white,
              }}
            >
              <span style={{ display: "flex", color: TLP.gray600 }}>{CARD_ICONS[card.cardBrand]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>
                  {fmtCardBrand(card.cardBrand)} •••• {card.last4}
                </div>
                <div style={{ fontSize: 12, color: TLP.gray500 }}>
                  Expires {fmtMonth(card.expMonth)}/{card.expYear}
                </div>
              </div>
              {card.isDefault ? (
                <Badge label="Default" color={TLP.teal} bg={TLP.tealLight} />
              ) : (
                <Button variant="ghost" size="sm">
                  Set default
                </Button>
              )}
              {!card.isDefault && (
                <Button variant="ghost" size="sm" style={{ color: TLP.red }}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice history */}
      <Card style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${TLP.gray100}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: TLP.navy }}>Invoice History</div>
          <Button variant="ghost" size="sm" icon={<Download size={14} strokeWidth={2.5} />}>
            Download all
          </Button>
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 130px 120px 90px 80px",
            padding: "10px 20px",
            background: TLP.gray50,
            fontSize: 11,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            gap: 8,
          }}
        >
          <span>Period</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Tax</span>
          <span>Status</span>
        </div>

        {invoices.map((inv, i) => (
          <InvoiceRow
            key={inv.id}
            invoice={inv}
            isLast={i === invoices.length - 1}
            isExpanded={expandedInvoice === inv.id}
            onToggle={() =>
              setExpandedInvoice((prev) => (prev === inv.id ? null : inv.id))
            }
          />
        ))}
      </Card>

      {/* Add card modal */}
      <Modal
        open={showAddCard}
        onClose={() => setShowAddCard(false)}
        title="Add Payment Method"
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Lock size={40} color={TLP.gray300} />
          </div>
          <p style={{ color: TLP.gray600, fontSize: 14, lineHeight: 1.6 }}>
            You'll be redirected to Stripe's secure payment page to enter your card details.
            Your card information is never stored on our servers.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowAddCard(false)}
            style={{ marginTop: 8 }}
          >
            Continue to Stripe <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Button>
          <p style={{ margin: "12px 0 0", fontSize: 11, color: TLP.gray400 }}>
            This is a prototype — Stripe is not wired up.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function InvoiceRow({
  invoice,
  isLast,
  isExpanded,
  onToggle,
}: {
  invoice: Invoice;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isPaid = invoice.status === "paid";
  const lineItems = INVOICE_LINE_ITEMS.filter((li) => li.invoiceId === invoice.id);

  return (
    <>
      <div
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 130px 120px 90px 80px",
          padding: "13px 20px",
          fontSize: 13,
          color: TLP.gray700,
          gap: 8,
          borderBottom: isLast && !isExpanded ? "none" : `1px solid ${TLP.gray100}`,
          alignItems: "center",
          cursor: "pointer",
          background: isExpanded ? TLP.gray50 : "transparent",
          transition: "background 0.1s",
        }}
      >
        <span style={{ fontWeight: 600, color: TLP.navy }}>
          {fmtInvoicePeriod(invoice.issuedAt)}
        </span>
        <span style={{ color: TLP.gray600 }}>{fmtInvoiceDate(invoice.issuedAt)}</span>
        <span style={{ fontWeight: 700, color: TLP.navy }}>${invoice.amount.toFixed(2)}</span>
        <span style={{ color: TLP.gray600 }}>${invoice.tax.toFixed(2)}</span>
        <Badge
          label={isPaid ? "Paid" : invoice.status === "failed" ? "Failed" : invoice.status}
          color={isPaid ? TLP.green : TLP.red}
          bg={isPaid ? TLP.greenLight : TLP.redLight}
        />
      </div>

      {/* Expanded line items */}
      {isExpanded && (
        <div
          style={{
            padding: "12px 20px 16px 40px",
            borderBottom: isLast ? "none" : `1px solid ${TLP.gray100}`,
            background: TLP.gray50,
          }}
        >
          {lineItems.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: TLP.gray400,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginBottom: 4,
                }}
              >
                Line Items
              </div>
              {lineItems.map((li) => (
                <div
                  key={li.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: TLP.gray700,
                  }}
                >
                  <span>{li.description}</span>
                  <span style={{ fontWeight: 600 }}>${li.amount.toFixed(2)}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  paddingTop: 8,
                  borderTop: `1px solid ${TLP.gray200}`,
                  fontWeight: 700,
                  color: TLP.navy,
                }}
              >
                <span>Total (incl. GST)</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>
              No line item detail available.
            </p>
          )}
          <div style={{ marginTop: 12 }}>
            <Button variant="secondary" size="sm" icon={<Download size={14} strokeWidth={2.5} />}>
              Download Receipt
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
