import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nxocuhlrldrbbltiqkqh.supabase.co";
const supabaseKey = "sb_publishable_yjkaTPvYf_WGYH5pgFlNYg_MnCue0u-";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.from("product_variants").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Columns:", Object.keys(data[0] || {}));
  }
}

checkColumns();
