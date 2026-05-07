import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { listRosters } from "@/lib/db/rosters";
import { TLP } from "@/lib/theme/tokens";
import Link from "next/link";

export default async function AdminRosterPage() {
  const supabase = await createClient();
  const rosters = await listRosters(supabase, {});

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <PageHeader 
          title="Roster Management" 
          subtitle="Manage weekly coach assignments and schedules"
        />
        <Button variant="primary">Create New Roster</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {rosters.map((roster: any) => (
          <Card key={roster.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TLP.teal }}>
                {roster.locations?.name.toUpperCase()}
              </div>
              <span style={{ 
                fontSize: 10, 
                padding: "2px 6px", 
                borderRadius: 4, 
                background: roster.status === 'published' ? TLP.teal + '20' : TLP.gray100,
                color: roster.status === 'published' ? TLP.teal : TLP.gray500,
                fontWeight: 700
              }}>
                {roster.status.toUpperCase()}
              </span>
            </div>
            
            <div style={{ fontSize: 18, fontWeight: 700, color: TLP.navy, marginBottom: 4 }}>
              Week of {roster.week_starting}
            </div>
            <div style={{ fontSize: 14, color: TLP.gray500, marginBottom: 20 }}>
              {roster.status === 'published' ? `Published on ${roster.published_at?.split('T')[0]}` : 'Last edited 2 days ago'}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/admin/roster/${roster.id}`} style={{ flex: 1 }}>
                <Button variant="secondary" style={{ width: "100%" }}>
                  {roster.status === 'published' ? 'View' : 'Edit Roster'}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
        {rosters.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", border: `2px dashed ${TLP.gray100}`, borderRadius: 12 }}>
            <div style={{ color: TLP.gray400, marginBottom: 16 }}>No rosters created yet.</div>
            <Button variant="primary">Generate First Roster</Button>
          </div>
        )}
      </div>
    </div>
  );
}
