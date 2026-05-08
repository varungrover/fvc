import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TLP } from "@/lib/theme/tokens";
import { listRosters } from "@/lib/db/rosters";

export default async function CoachSessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split('T')[0];

  // Get active assignments for today
  const { data: assignments, error } = await supabase
    .from("roster_assignments")
    .select("*, batches(*), rosters(*)")
    .eq("coach_id", user?.id)
    .eq("session_date", today)
    .eq("rosters.status", "published");

  if (error) {
    console.error("Error fetching sessions:", error);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader 
        title="Session Tracking" 
        subtitle="Mark attendance and record student progress"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: TLP.navy, marginBottom: 16 }}>Today's Classes</h3>
          {assignments?.map((asgn: any) => (
            <Card key={asgn.id} style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TLP.navy }}>{asgn.batches?.name}</div>
                  <div style={{ fontSize: 14, color: TLP.gray500 }}>{asgn.batches?.start_time} - {asgn.batches?.end_time} • Room {asgn.room_id || 'TBD'}</div>
                </div>
                <button style={{ 
                  padding: "8px 16px", 
                  borderRadius: 6, 
                  background: TLP.teal, 
                  color: "white", 
                  border: "none", 
                  fontWeight: 700,
                  cursor: "pointer"
                }}>
                  Mark Attendance
                </button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, padding: "4px 8px", background: TLP.gray50, borderRadius: 4, color: TLP.gray600, fontWeight: 600 }}>
                  12 STUDENTS ENROLLED
                </span>
                <span style={{ fontSize: 11, padding: "4px 8px", background: TLP.amber + '10', borderRadius: 4, color: TLP.amber, fontWeight: 600 }}>
                  2 TRIALS BOOKED
                </span>
              </div>
            </Card>
          ))}
          {(!assignments || assignments.length === 0) && (
            <div style={{ padding: 60, textAlign: "center", border: `2px dashed ${TLP.gray100}`, borderRadius: 12 }}>
              <div style={{ color: TLP.gray400 }}>No sessions scheduled for today.</div>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: TLP.navy, marginBottom: 16 }}>Pending Assessments</h3>
          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 14, color: TLP.gray500, textAlign: "center", padding: 20 }}>
              Assessment queue is clear. All trials processed.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
