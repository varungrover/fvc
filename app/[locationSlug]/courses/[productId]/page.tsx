import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailsPage from '@/components/courses/ProductDetailsPage'

interface Props {
  params: Promise<{ locationSlug: string; productId: string }>
}

export default async function Page({ params }: Props) {
  const { locationSlug, productId } = await params
  const supabase = await createClient()

  // 1. Fetch Location
  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', locationSlug)
    .single()

  if (!location) notFound()

  // 2. Fetch Product & Planet
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      planet:planets(*)
    `)
    .eq('id', productId)
    .single()

  if (!product) notFound()

  // 3. Fetch Tenant (Ownership)
  const { data: ownership } = await supabase
    .from('ownerships')
    .select('*')
    .eq('id', location.ownership_id)
    .single()

  if (!ownership) notFound()

  // 4. Fetch Variants for this product at this location
  const { data: offerings } = await supabase
    .from('location_course_offerings')
    .select('product_variant_id')
    .eq('location_id', location.id)
    .eq('is_active', true)

  const variantIds = offerings?.map(o => o.product_variant_id) || []

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('id', variantIds)
    .eq('product_id', productId)

  // 5. Fetch Batches for this product at this location
  const { data: batches } = await supabase
    .from('batches')
    .select('*')
    .eq('location_id', location.id)
    .eq('product_id', productId)
    .eq('is_active', true)

  return (
    <ProductDetailsPage
      location={location}
      tenant={ownership}
      product={product}
      planet={product.planet}
      variants={variants || []}
      batches={batches || []}
    />
  )
}
