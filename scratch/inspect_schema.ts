import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nxocuhlrldrbbltiqkqh.supabase.co";
const supabaseKey = "sb_publishable_yjkaTPvYf_WGYH5pgFlNYg_MnCue0u-";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  // Try to find if there are any views
  const { data, error } = await supabase.from('product_variants').select('id').limit(1);
  console.log("Direct select ID error:", error);
  
  // Try to select base_price specifically
  const { data: data2, error: error2 } = await supabase.from('product_variants').select('base_price').limit(1);
  console.log("Select base_price error:", error2);

  // Try to select price specifically
  const { data: data3, error: error3 } = await supabase.from('product_variants').select('price').limit(1);
  console.log("Select price error:", error3);
}

inspectSchema();
