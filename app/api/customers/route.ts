import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userProfile = await supabase
      .from('profiles')
      .select('role_id, ownership_id, roles(name)')
      .eq('id', session.user.id)
      .single()

    const roleName = (userProfile.data?.roles as any)?.name
    if (roleName !== 'franchisee_admin' && roleName !== 'franchisor_admin' && roleName !== 'franchisor_mgmt') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ownershipId = userProfile.data?.ownership_id
    if (!ownershipId && roleName === 'franchisee_admin') {
      return NextResponse.json({ error: 'No ownership assigned to admin' }, { status: 400 })
    }

    const body = await req.json()
    const { fullName, email, phone, dob, gender, cfcId } = body

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 })
    }

    const adminAuthClient = createAdminClient()

    // Create the user in Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'customer'
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // The trigger in 001_profiles.sql will automatically create the profile.
    // However, we need to assign the correct ownership_id to the profile
    // so that the trigger in 009 can copy it to the customers table.
    
    // Actually, the trigger on profiles runs immediately, but we might need to update 
    // the profile to set the ownership_id, and then update the customers table.
    // Or we can just update the customers table directly since it's already created.
    
    // Wait for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500))

    // Set ownership_id and other customer specific fields
    await adminAuthClient
      .from('profiles')
      .update({ ownership_id: ownershipId })
      .eq('id', authData.user.id)

    const customerUpdates = {
      phone: phone || null,
      gender: gender || null,
      cfc_id: cfcId || null,
      ownership_id: ownershipId
    }

    await adminAuthClient
      .from('customers')
      .update(customerUpdates)
      .eq('profile_id', authData.user.id)

    return NextResponse.json({ success: true, userId: authData.user.id })

  } catch (error: any) {
    console.error('Customer creation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
