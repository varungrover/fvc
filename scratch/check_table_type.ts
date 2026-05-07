import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nxocuhlrldrbbltiqkqh.supabase.co";
const supabaseKey = "sb_publishable_yjkaTPvYf_WGYH5pgFlNYg_MnCue0u-";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableType() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'product_variants' });
  // Since I can't run arbitrary RPCs easily if not defined, I'll try to query the information_schema via a trick if possible, 
  // but Supabase blocks direct access to information_schema via the REST API usually.
  
  // Let's just try to select everything and see if there's any hidden column or if it's a view.
  const { data: cols, error: err } = await supabase.from('product_variants').select('*').limit(0);
  console.log("Error:", err);
  console.log("Cols:", cols);
}

checkTableType();
