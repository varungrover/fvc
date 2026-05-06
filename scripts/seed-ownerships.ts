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

const SEED_OWNERSHIPS = [
  {
    full_name: 'The Learning Planet',
    email: 'ops@learningplanet.com',
    ownership_type: 'corporate' as const,
    slug: 'learning-planet',
    brand_primary: '#805ad5',
    brand_accent: '#f5a623',
    tagline: 'Where curious kids become confident learners.',
  },
  {
    full_name: 'Maple Leaf Academy',
    email: 'hello@mapleleafacademy.ca',
    ownership_type: 'franchisee' as const,
    slug: 'maple-leaf',
    brand_primary: '#0a9b8a',
    brand_accent: '#e67e22',
    tagline: "Canadian academies for tomorrow's leaders.",
  },
]

// Demo user → which ownership slug they belong to
const USER_OWNERSHIP_MAP: Record<string, string> = {
  'franchisor.admin@demo.com': 'learning-planet',
  'franchisor.mgmt@demo.com':  'learning-planet',
  'coach@demo.com':             'learning-planet',
  'franchisee.admin@demo.com': 'maple-leaf',
  'franchisee.mgmt@demo.com':  'maple-leaf',
  // parent@demo.com has no ownership_id
}

async function seed() {
  console.log('Seeding ownerships…\n')

  // 1. Upsert ownerships by slug
  const ownershipBySlug: Record<string, string> = {}

  for (const o of SEED_OWNERSHIPS) {
    const { data: existing } = await admin
      .from('ownerships')
      .select('id')
      .eq('slug', o.slug)
      .single()

    if (existing) {
      console.log(`  ✓ skip  ${o.full_name} (already exists, id: ${existing.id})`)
      ownershipBySlug[o.slug] = existing.id
      continue
    }

    const { data, error } = await admin
      .from('ownerships')
      .insert(o)
      .select('id')
      .single()

    if (error || !data) {
      console.error(`  ✗ fail  ${o.full_name}: ${error?.message}`)
      process.exit(1)
    }

    console.log(`  ✓ create ${o.full_name} (id: ${data.id})`)
    ownershipBySlug[o.slug] = data.id
  }

  // 2. Update demo users: app_metadata + profiles.ownership_id
  console.log('\nUpdating demo user ownership_id…\n')

  const { data: users } = await admin.auth.admin.listUsers()

  for (const [email, slug] of Object.entries(USER_OWNERSHIP_MAP)) {
    const ownershipId = ownershipBySlug[slug]
    if (!ownershipId) {
      console.error(`  ✗ no ownership found for slug "${slug}"`)
      continue
    }

    const user = (users?.users ?? []).find((u) => u.email === email)
    if (!user) {
      console.log(`  - skip  ${email} (user not found)`)
      continue
    }

    // Update app_metadata
    const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, ownership_id: ownershipId },
    })
    if (metaError) {
      console.error(`  ✗ meta  ${email}: ${metaError.message}`)
      continue
    }

    // Update profiles table
    const { error: profileError } = await admin
      .from('profiles')
      .update({ ownership_id: ownershipId })
      .eq('id', user.id)
    if (profileError) {
      console.error(`  ✗ profile ${email}: ${profileError.message}`)
      continue
    }

    console.log(`  ✓ ${email} → ${slug} (${ownershipId})`)
  }

  console.log('\nDone.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
