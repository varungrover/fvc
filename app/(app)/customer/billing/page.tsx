import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { listInvoices } from "@/lib/db/invoices";
import { listPaymentMethods } from "@/lib/db/paymentMethods";
import { TLP } from "@/lib/theme/tokens";

export default async function CustomerBillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const invoices = user ? await listInvoices(supabase, { customerId: user.id }) : [];
  const paymentMethods = user ? await listPaymentMethods(supabase, user.id) : [];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader 
        title="Billing & Payments" 
        subtitle="Manage your subscriptions and view payment history"
      />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: TLP.navy, marginBottom: 16 }}>Invoices</h3>
          <Card style={{ padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: TLP.gray50, borderBottom: `1px solid ${TLP.gray100}` }}>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>DATE</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>AMOUNT</th>
                  <th style={{ padding: 12, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>STATUS</th>
                  <th style={{ padding: 12, textAlign: "right", fontSize: 12, color: TLP.gray500 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${TLP.gray100}` }}>
                    <td style={{ padding: 12 }}>{inv.issued_at.split('T')[0]}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>${inv.total}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: inv.status === 'paid' ? TLP.teal : TLP.orange 
                      }}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "right" }}>
                      <Button variant="secondary" size="sm">PDF</Button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: "center", color: TLP.gray400 }}>No billing history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: TLP.navy, marginBottom: 16 }}>Payment Methods</h3>
          <Card style={{ padding: 20 }}>
            {paymentMethods.map((pm: any) => (
              <div key={pm.id} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                padding: 12, 
                borderRadius: 8,
                border: `1px solid ${pm.is_default ? TLP.teal : TLP.gray100}`,
                marginBottom: 12
              }}>
                <div style={{ width: 40, height: 24, background: TLP.gray50, borderRadius: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>•••• {pm.last4}</div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>Exp {pm.exp_month}/{pm.exp_year}</div>
                </div>
                {pm.is_default && <span style={{ fontSize: 10, color: TLP.teal, fontWeight: 700 }}>DEFAULT</span>}
              </div>
            ))}
            <Button variant="primary" style={{ width: "100%", marginTop: 10 }}>Add Card</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
