"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TLP } from "@/lib/theme/tokens";

export default function RosterBuilder({ roster, coaches, batches }: any) {
  const [assignments, setAssignments] = useState(roster.roster_assignments || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAssign = async (batchId: string, coachId: string) => {
    // Optimistic UI or direct API call
    console.log(`Assigning ${coachId} to ${batchId}`);
  };

  const publish = async () => {
     // Call PATCH /api/rosters/[id]
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <PageHeader 
          title={`Roster: Week of ${roster.week_starting}`} 
          subtitle={`${roster.locations?.name} • ${roster.status.toUpperCase()}`}
        />
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="secondary">Save Draft</Button>
          <Button variant="primary" onClick={publish} disabled={roster.status === 'published'}>
            Publish Roster
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: TLP.gray50, borderBottom: `1px solid ${TLP.gray100}` }}>
                <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>TIME SLOT</th>
                <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>BATCH / PROGRAM</th>
                <th style={{ padding: 16, textAlign: "left", fontSize: 12, color: TLP.gray500 }}>ASSIGNED COACH</th>
                <th style={{ padding: 16, textAlign: "right", fontSize: 12, color: TLP.gray500 }}>ROOM</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch: any) => {
                const assignment = assignments.find((a: any) => a.batch_id === batch.id);
                return (
                  <tr key={batch.id} style={{ borderBottom: `1px solid ${TLP.gray100}` }}>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 600 }}>{batch.start_time} - {batch.end_time}</td>
                    <td style={{ padding: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TLP.navy }}>{batch.name}</div>
                      <div style={{ fontSize: 12, color: TLP.gray500 }}>{batch.day_of_week}</div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <select 
                        defaultValue={assignment?.coach_id || ""}
                        style={{ 
                          width: "100%", 
                          padding: "8px 12px", 
                          borderRadius: 6, 
                          border: `1px solid ${TLP.gray200}`,
                          fontSize: 14
                        }}
                      >
                        <option value="">Select Coach...</option>
                        {coaches.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.full_name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: 16, textAlign: "right" }}>
                      <input 
                        type="text" 
                        placeholder="Room"
                        defaultValue={assignment?.room_id || ""}
                        style={{ 
                          width: 80, 
                          padding: "8px 12px", 
                          borderRadius: 6, 
                          border: `1px solid ${TLP.gray200}`,
                          fontSize: 14,
                          textAlign: "center"
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TLP.navy, marginBottom: 16 }}>Coach Availability</h3>
          <Card style={{ padding: 20 }}>
            {coaches.map((c: any) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: TLP.gray100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                  {c.full_name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.full_name}</div>
                  <div style={{ fontSize: 11, color: TLP.teal, fontWeight: 700 }}>4 SESSIONS ASSIGNED</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
