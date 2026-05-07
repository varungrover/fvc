import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndDelete() {
  // 1. Find the Chess planet
  const { data: planets } = await supabase
    .from("planets")
    .select("id, name")
    .eq("name", "Chess");

  if (!planets || planets.length === 0) {
    console.log("Chess planet not found");
    return;
  }
  const chessId = planets[0].id;

  // 2. Find the Open product (level) for Chess
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("planet_id", chessId)
    .eq("name", "Open");

  if (!products || products.length === 0) {
    console.log("Open level not found in Chess");
    return;
  }
  const openLevelId = products[0].id;

  console.log(`Found Open Level (ID: ${openLevelId}) in Chess (ID: ${chessId})`);

  // 3. Delete variants
  const { error: variantError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", openLevelId);

  if (variantError) {
    console.error("Error deleting variants:", variantError);
    return;
  }
  console.log("Deleted variants for Open level");

  // 4. Delete the product (level)
  const { error: productError } = await supabase
    .from("products")
    .delete()
    .eq("id", openLevelId);

  if (productError) {
    console.error("Error deleting level:", productError);
    return;
  }
  console.log("Deleted Open level");
}

findAndDelete();
