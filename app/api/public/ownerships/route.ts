import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ownerships')
    .select('id, full_name, ownership_type, slug, logo_url, brand_primary, brand_accent, tagline')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
