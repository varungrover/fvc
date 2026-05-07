import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const envPaths = ['.env.local', '../.env.local', '../../.env.local'].map((p) => resolve(process.cwd(), p))
const envPath = envPaths.find(existsSync)
if (envPath) config({ path: envPath })
else config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === '<NEEDS_TO_BE_SET>') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const COACHES = [
  { name: 'Marcus Aurelius', email: 'marcus@chess.com', ownership: 'learning-planet' },
  { name: 'Judit Polgar', email: 'judit@chess.com', ownership: 'learning-planet' },
  { name: 'Magnus Carlsen', email: 'magnus@chess.com', ownership: 'learning-planet' },
  { name: 'Hikaru Nakamura', email: 'hikaru@chess.com', ownership: 'learning-planet' },
  { name: 'Fabiano Caruana', email: 'fabiano@chess.com', ownership: 'learning-planet' },
  { name: 'Anish Giri', email: 'anish@chess.com', ownership: 'maple-leaf' },
  { name: 'Wesley So', email: 'wesley@chess.com', ownership: 'maple-leaf' },
  { name: 'Levon Aronian', email: 'levon@chess.com', ownership: 'maple-leaf' },
  { name: 'Vidit Gujrathi', email: 'vidit@chess.com', ownership: 'maple-leaf' },
  { name: 'Gukesh D', email: 'gukesh@chess.com', ownership: 'maple-leaf' },
]

async function seed() {
  console.log('Seeding staff...')

  // 1. Get Ownerships
  const { data: ownerships } = await admin.from('ownerships').select('id, slug')
  const ownershipMap = Object.fromEntries(ownerships!.map(o => [o.slug, o.id]))

  // 2. Get Planets
  const { data: planets } = await admin.from('planets').select('id, name')
  
  // 3. Get Role ID for Coach (5)
  const roleId = 5

  for (const coach of COACHES) {
    console.log(`Processing ${coach.name}...`)
    const ownershipId = ownershipMap[coach.ownership]
    
    // Check if user exists in auth
    const { data: { users } } = await admin.auth.admin.listUsers()
    let user = users.find(u => u.email === coach.email)

    if (!user) {
      console.log(`  creating auth user ${coach.email}`)
      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email: coach.email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: coach.name },
        app_metadata: { role: 'coach', ownership_id: ownershipId }
      })
      if (createErr) {
        console.error(`  ✗ failed to create ${coach.email}:`, createErr.message)
        continue
      }
      user = newUser.user
    }

    // Check if profile exists
    const { data: profile } = await admin.from('profiles').select('id').eq('id', user!.id).maybeSingle()
    if (!profile) {
      console.log(`  creating profile for ${coach.name}`)
      await admin.from('profiles').insert({
        id: user!.id,
        email: coach.email,
        full_name: coach.name,
        role_id: roleId,
        ownership_id: ownershipId
      })
    }

    // 4. Qualifications (Planet Assignments) - Give 1-2 random planets
    const planetCount = Math.floor(Math.random() * 2) + 1
    const shuffledPlanets = [...planets!].sort(() => 0.5 - Math.random())
    const selectedPlanets = shuffledPlanets.slice(0, planetCount)

    for (const p of selectedPlanets) {
      await admin.from('staff_planets').upsert({ profile_id: user!.id, planet_id: p.id }, { onConflict: 'profile_id, planet_id' })
    }

    // 5. Availability (Mon-Fri 4-9 PM)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    for (const day of days) {
      await admin.from('staff_availability').upsert({
        profile_id: user!.id,
        day_of_week: day,
        start_time: '16:00:00',
        end_time: '21:00:00'
      }, { onConflict: 'profile_id, day_of_week' })
    }

    // 6. Leaves (Add a leave for Marcus today)
    if (coach.name === 'Marcus Aurelius') {
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      await admin.from('staff_leaves').insert({
        profile_id: user!.id,
        start_date: today,
        end_date: nextWeek,
        reason: 'Resting like a Stoic',
        status: 'approved'
      })
    }
  }

  console.log('Done.')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
