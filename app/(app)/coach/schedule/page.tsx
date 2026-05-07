import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TLP } from "@/lib/theme/tokens";

export default async function CoachSchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch assignments for this coach in published rosters
  const { data: assignments } = await supabase
    .from("roster_assignments")
    .select("*, rosters!inner(*), batches(*)")
    .eq("coach_id", user?.id)
    .eq("rosters.status", "published");

  return (
    <div style={{ padding: 24 }}>
      <PageHeader 
        title="My Schedule" 
        subtitle="Your assigned classes and sessions for this week"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
        {assignments?.map((asgn: any) => (
          <Card key={asgn.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 8, 
                background: TLP.teal + '10', 
                color: TLP.teal,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800
              }}>
                <div style={{ fontSize: 10 }}>{asgn.batches?.day_of_week.substring(0, 3).toUpperCase()}</div>
                <div style={{ fontSize: 16 }}>{asgn.rosters?.week_starting.split('-')[2]}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: TLP.navy }}>{asgn.batches?.name}</div>
                <div style={{ fontSize: 14, color: TLP.gray500 }}>{asgn.batches?.start_time} - {asgn.batches?.end_time}</div>
              </div>
            </div>

            <div style={{ padding: "12px 16px", background: TLP.gray50, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: TLP.gray500 }}>Location</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Main Branch</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: TLP.gray500 }}>Room</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{asgn.room_id || 'TBD'}</span>
              </div>
            </div>

            {asgn.notes && (
              <div style={{ fontSize: 12, color: TLP.gray600, fontStyle: "italic", marginBottom: 16 }}>
                "{asgn.notes}"
              </div>
            )}

            <button style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: 6, 
              background: "white", 
              border: `1px solid ${TLP.teal}`, 
              color: TLP.teal,
              fontWeight: 600,
              cursor: "pointer"
            }}>
              Start Session
            </button>
          </Card>
        ))}
        {(!assignments || assignments.length === 0) && (
          <div style={{ gridColumn: "1 / -1", padding: 80, textAlign: "center", background: TLP.gray50, borderRadius: 12 }}>
            <div style={{ color: TLP.gray400, fontSize: 16 }}>No upcoming sessions assigned to you.</div>
          </div>
        )}
      </div>
    </div>
  );
}
