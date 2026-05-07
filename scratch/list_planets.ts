import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listPlanets() {
  const { data: planets } = await supabase.from("planets").select("name");
  console.log("Planets in DB:", planets?.map(p => p.name));
}

listPlanets();
