import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { listInvoices } from "@/lib/db/invoices";
import { TLP } from "@/lib/theme/tokens";

export default async function AdminBillingPage() {
  const supabase = await createClient();
  const invoices = await listInvoices(supabase, {});

  return (
    <div style={{ padding: 24 }}>
      <PageHeader 
        title="Billing & Invoices" 
        subtitle="Manage academy revenue and payment collection"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ color: TLP.gray500, fontSize: 14 }}>Total Revenue</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: TLP.navy }}>$12,450</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: TLP.gray500, fontSize: 14 }}>Pending Invoices</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: TLP.amber }}>24</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: TLP.gray500, fontSize: 14 }}>Failed Payments</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: TLP.red }}>3</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: TLP.gray500, fontSize: 14 }}>Active Subscriptions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: TLP.teal }}>156</div>
        </Card>
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: TLP.gray50, borderBottom: `1px solid ${TLP.gray100}` }}>
              <th style={{ padding: 16, textAlign: "left", color: TLP.gray500, fontSize: 12 }}>CUSTOMER</th>
              <th style={{ padding: 16, textAlign: "left", color: TLP.gray500, fontSize: 12 }}>AMOUNT</th>
              <th style={{ padding: 16, textAlign: "left", color: TLP.gray500, fontSize: 12 }}>STATUS</th>
              <th style={{ padding: 16, textAlign: "left", color: TLP.gray500, fontSize: 12 }}>DUE DATE</th>
              <th style={{ padding: 16, textAlign: "right", color: TLP.gray500, fontSize: 12 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} style={{ borderBottom: `1px solid ${TLP.gray100}` }}>
                <td style={{ padding: 16, fontWeight: 500 }}>{inv.profiles?.full_name}</td>
                <td style={{ padding: 16 }}>${inv.total}</td>
                <td style={{ padding: 16 }}>
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: 4, 
                    fontSize: 12, 
                    fontWeight: 600,
                    background: inv.status === 'paid' ? TLP.teal + '20' : TLP.amber + '20',
                    color: inv.status === 'paid' ? TLP.teal : TLP.amber
                  }}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: 16 }}>{inv.due_date}</td>
                <td style={{ padding: 16, textAlign: "right" }}>
                  <button style={{ color: TLP.teal, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View</button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: TLP.gray400 }}>No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
