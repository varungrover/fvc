/**
 * Idempotent seed script for demo Supabase auth users.
 *
 * Prerequisites:
 *   - .env.local must contain NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - Get the service role key from: Supabase Dashboard → Project Settings → API → service_role
 *
 * Run: npm run seed:auth
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Look for .env.local in cwd first, then one level up (worktree → repo root)
const envPaths = ['.env.local', '../.env.local'].map((p) => resolve(process.cwd(), p))
const envPath = envPaths.find(existsSync)
if (envPath) {
  config({ path: envPath })
} else {
  config({ path: '.env.local' }) // let dotenv report the missing file
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === '<NEEDS_TO_BE_SET>') {
  console.error(
    'Missing or placeholder NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Get the service_role key from: Supabase Dashboard → Project Settings → API'
  )
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = 'demo1234!'

const SEED_USERS = [
  {
    email: 'parent@demo.com',
    full_name: 'Raj Sharma',
    role: 'customer',
    ownership_id: null,
  },
  {
    email: 'coach@demo.com',
    full_name: 'Priya Patel',
    role: 'coach',
    ownership_id: 'ten_tlp',
  },
  {
    email: 'franchisor.admin@demo.com',
    full_name: 'Mira Sandhu',
    role: 'franchisor_admin',
    ownership_id: 'ten_tlp',
  },
  {
    email: 'franchisee.admin@demo.com',
    full_name: 'Jordan Bell',
    role: 'franchisee_admin',
    ownership_id: 'ten_mla',
  },
  {
    email: 'franchisor.mgmt@demo.com',
    full_name: 'Anika Iyer',
    role: 'franchisor_management',
    ownership_id: 'ten_tlp',
  },
  {
    email: 'franchisee.mgmt@demo.com',
    full_name: 'David Chen',
    role: 'franchisee_management',
    ownership_id: 'ten_mla',
  },
] as const

async function seed() {
  console.log('Seeding demo auth users…\n')

  // Get existing users
  const { data: existing } = await admin.auth.admin.listUsers()
  const existingEmails = new Set(existing?.users.map((u) => u.email?.toLowerCase()) ?? [])

  for (const user of SEED_USERS) {
    if (existingEmails.has(user.email.toLowerCase())) {
      console.log(`  ✓ skip  ${user.email} (already exists)`)
      continue
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      app_metadata: {
        role: user.role,
        ownership_id: user.ownership_id,
        full_name: user.full_name,
        must_change_password: false,
      },
    })

    if (error) {
      console.error(`  ✗ fail  ${user.email}: ${error.message}`)
    } else {
      console.log(`  ✓ create ${user.email} (id: ${data.user.id})`)
    }
  }

  // Verify profiles rows exist (created automatically by DB trigger on_auth_user_created)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, role, ownership_id, full_name')
  console.log('\nProfiles in DB:', profiles?.length ?? 0)
  profiles?.forEach((p) =>
    console.log(`  ${p.full_name} (${p.role}) - ${p.ownership_id ?? 'no ownership'}`)
  )

  console.log('\nDone.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
