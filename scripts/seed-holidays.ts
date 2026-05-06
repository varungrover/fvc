import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const HOLIDAYS = [
  { holiday_date: '2026-01-01', description: "New Year's Day" },
  { holiday_date: '2026-02-16', description: "Family Day" },
  { holiday_date: '2026-04-03', description: "Good Friday" },
  { holiday_date: '2026-05-18', description: "Victoria Day" },
  { holiday_date: '2026-07-01', description: "Canada Day" },
  { holiday_date: '2026-09-07', description: "Labour Day" },
  { holiday_date: '2026-10-12', description: "Thanksgiving Day" },
  { holiday_date: '2026-11-11', description: "Remembrance Day" },
  { holiday_date: '2026-12-25', description: "Christmas Day" },
];

async function seed() {
  console.log("Seeding holidays...");
  
  const { data: ownerships } = await supabase.from('ownerships').select('id, slug');
  const tlp = ownerships?.find(o => o.slug === 'learning-planet');

  for (const h of HOLIDAYS) {
    const { error } = await supabase
      .from('holidays')
      .upsert({
        ...h,
        ownership_id: null, // Global
        location_id: null
      }, {
        onConflict: 'holiday_date, ownership_id, location_id'
      });
    
    if (error) console.error(`Error seeding ${h.description}:`, error.message);
  }

  // Seed one ownership-specific holiday for TLP
  if (tlp) {
    const { error } = await supabase
      .from('holidays')
      .upsert({
        holiday_date: '2026-08-03',
        description: 'BC Day (TLP Specific)',
        ownership_id: tlp.id,
        location_id: null
      }, {
        onConflict: 'holiday_date, ownership_id, location_id'
      });
    if (error) console.error("Error seeding BC Day:", error.message);
  }

  console.log("Holidays seeded.");
}

seed();
