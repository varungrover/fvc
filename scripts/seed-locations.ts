import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const envPaths = ['.env.local', '../.env.local', '../../.env.local', '../../../.env.local'].map((p) => resolve(process.cwd(), p))
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

const SEED_LOCATIONS = [
  // The Learning Planet (slug: 'learning-planet')
  {
    ownershipSlug: 'learning-planet',
    name: 'Surrey Central',
    address_line1: '10153 King George Blvd',
    city: 'Surrey',
    state_province: 'BC',
    country: 'Canada',
    postal_code: 'V3T 2W1',
  },
  {
    ownershipSlug: 'learning-planet',
    name: 'Abbotsford',
    address_line1: '32700 South Fraser Way',
    city: 'Abbotsford',
    state_province: 'BC',
    country: 'Canada',
    postal_code: 'V2S 2A8',
  },
  {
    ownershipSlug: 'learning-planet',
    name: 'Langley',
    address_line1: '20151 Fraser Hwy',
    city: 'Langley',
    state_province: 'BC',
    country: 'Canada',
    postal_code: 'V3A 4E4',
  },
  // Maple Leaf Academy (slug: 'maple-leaf')
  {
    ownershipSlug: 'maple-leaf',
    name: 'Toronto Downtown',
    address_line1: '365 Bloor St E',
    city: 'Toronto',
    state_province: 'ON',
    country: 'Canada',
    postal_code: 'M4W 3L4',
  },
  {
    ownershipSlug: 'maple-leaf',
    name: 'Mississauga',
    address_line1: '100 City Centre Dr',
    city: 'Mississauga',
    state_province: 'ON',
    country: 'Canada',
    postal_code: 'L5B 2C9',
  },
  {
    ownershipSlug: 'maple-leaf',
    name: 'Brampton',
    address_line1: '25 Peel Centre Dr',
    city: 'Brampton',
    state_province: 'ON',
    country: 'Canada',
    postal_code: 'L6T 3R5',
  },
]

async function seed() {
  console.log('Seeding locations...')

  // Fetch ownership IDs by slug
  const { data: ownerships, error: ownershipErr } = await admin
    .from('ownerships')
    .select('id, slug')

  if (ownershipErr || !ownerships) {
    console.error('Failed to fetch ownerships:', ownershipErr)
    process.exit(1)
  }

  const ownershipIdBySlug: Record<string, string> = Object.fromEntries(
    ownerships.map((o) => [o.slug, o.id]),
  )

  for (const loc of SEED_LOCATIONS) {
    const ownershipId = ownershipIdBySlug[loc.ownershipSlug]
    if (!ownershipId) {
      console.error(`  ✗ no ownership found for slug "${loc.ownershipSlug}" — run seed-ownerships first`)
      process.exit(1)
    }

    // Check for existing location by name + ownership_id
    const { data: existing } = await admin
      .from('locations')
      .select('id')
      .eq('ownership_id', ownershipId)
      .eq('name', loc.name)
      .maybeSingle()

    if (existing) {
      console.log(`  ✓ skip  ${loc.name} (already exists, id: ${existing.id})`)
      continue
    }

    const { data, error } = await admin.from('locations').insert({
      ownership_id: ownershipId,
      name: loc.name,
      address_line1: loc.address_line1,
      city: loc.city,
      state_province: loc.state_province,
      country: loc.country,
      postal_code: loc.postal_code,
      is_active: true,
    }).select('id').single()

    if (error) {
      console.error(`  ✗ ${loc.name}:`, error.message)
      process.exit(1)
    }

    console.log(`  ✓ create ${loc.name} (id: ${data.id})`)
  }

  console.log('Done.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
