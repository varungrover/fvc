import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listLocations } from "@/lib/db/locations";
import { BatchesClient } from "./BatchesClient";

export default async function AdminSchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const locations = await listLocations(supabase, session);

  const { data: planets } = await supabase
    .from('planets')
    .select('*, products(*)')
    .order('name');

  return (
    <Suspense fallback={<div>Loading batches...</div>}>
      <BatchesClient 
        locations={locations} 
        planets={planets || []}
        role={session.role}
      />
    </Suspense>
  );
}
