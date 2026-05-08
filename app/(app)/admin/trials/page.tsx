import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { listTrials } from "@/lib/db/trials";
import { TLP } from "@/lib/theme/tokens";
import { Button } from "@/components/ui/Button";

export default async function AdminTrialsPage() {
  const supabase = await createClient();
  const trials = await listTrials(supabase, {});

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <PageHeader 
          title="Trial Management" 
          subtitle="Track prospective students and trial assessments"
        />
        <Button variant="primary">Book Trial Class</Button>
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: TLP.gray50, borderBottom: `1px solid ${TLP.gray100}` }}>
              <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>STUDENT</th>
              <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>DATE & TIME</th>
              <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>BATCH</th>
              <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>STATUS</th>
              <th style={{ padding: 16, textAlign: "right", fontSize: 12, color: TLP.gray500 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial: any) => (
              <tr key={trial.id} style={{ borderBottom: `1px solid ${TLP.gray100}` }}>
                <td style={{ padding: 16, fontWeight: 600 }}>{trial.members?.full_name}</td>
                <td style={{ padding: 16 }}>{trial.booked_at.split('T')[0]}</td>
                <td style={{ padding: 16 }}>{trial.roster_assignments?.batches?.name}</td>
                <td style={{ padding: 16 }}>
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: 4, 
                    fontSize: 11, 
                    fontWeight: 700,
                    background: trial.status === 'booked' ? TLP.amber + '10' : TLP.teal + '10',
                    color: trial.status === 'booked' ? TLP.amber : TLP.teal
                  }}>
                    {trial.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: "right" }}>
                  <Button variant="secondary" size="sm">Details</Button>
                </td>
              </tr>
            ))}
            {trials.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 60, textAlign: "center", color: TLP.gray400 }}>No trial bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
