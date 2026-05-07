import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const envPaths = ['.env.local', '../.env.local'].map((p) => resolve(process.cwd(), p))
const envPath = envPaths.find(existsSync)
if (envPath) config({ path: envPath })
else config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🚀 Seeding batches...')

  // 1. Get all locations and products (levels)
  const { data: locations, error: locError } = await admin.from('locations').select('id, name')
  const { data: levels, error: levelError } = await admin.from('products').select('id, name')

  if (locError || levelError || !locations || !levels) {
    console.error('Failed to fetch foundations:', locError || levelError)
    return
  }

  console.log(`Found ${locations.length} locations and ${levels.length} levels.`)

  const batches = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const times = [
    { start: '16:00:00', end: '17:00:00' },
    { start: '17:15:00', end: '18:15:00' },
    { start: '18:30:00', end: '19:30:00' },
  ]

  for (const loc of locations) {
    console.log(`  Generating batches for ${loc.name}...`)
    for (const level of levels) {
      // Pick 2 random days for each level at each location
      const selectedDays = [...days].sort(() => 0.5 - Math.random()).slice(0, 2)
      
      for (const day of selectedDays) {
        // Pick a random time slot
        const time = times[Math.floor(Math.random() * times.length)]
        
        batches.push({
          location_id: loc.id,
          product_id: level.id,
          day_of_week: day,
          start_time: time.start,
          end_time: time.end,
          max_capacity: 8,
          is_active: true
        })
      }
    }
  }

  const { error } = await admin.from('batches').insert(batches)
  if (error) {
    console.error('❌ Seed error:', error)
  } else {
    console.log(`✅ Successfully seeded ${batches.length} batches!`)
  }
}

seed()
