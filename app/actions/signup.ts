'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signupAction(
  formData: FormData,
  nextPath?: string
): Promise<{ error: string } | never> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const parentName = (formData.get('parentName') as string | null) ?? ''
  const phone = (formData.get('phone') as string | null) ?? ''
  const childName = (formData.get('childName') as string | null) ?? ''
  const childDob = (formData.get('childDob') as string | null) ?? ''
  const childGender = (formData.get('childGender') as string | null) ?? ''

  if (!email || !password || !parentName || !childName || !childDob) {
    return { error: 'All required fields must be filled.' }
  }

  const admin = createAdminClient()
  
  // 1. Create the user via admin to bypass client-side app_metadata restrictions
  // This ensures the handle_new_user() trigger finds the 'customer' role
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: parentName,
      role: 'customer' // Redundant for the trigger
    },
    app_metadata: {
      role: 'customer'
    }
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Signup failed.' }
  }

  // 2. Sign in the user so they have a session
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    return { error: 'Account created but login failed. Please try logging in manually.' }
  }

  const userId = authData.user.id

  let memberId: string | undefined;

  try {
    // 2. Create or update customer record
    const { data: customer, error: customerError } = await admin
      .from('customers')
      .upsert({
        profile_id: userId,
        phone,
        terms_accepted: true
      }, { onConflict: 'profile_id' })
      .select()
      .single()

    if (customerError) throw customerError

    // 3. Create member (student) record
    const { data: member, error: memberError } = await admin
      .from('members')
      .insert({
        customer_id: customer.id,
        full_name: childName,
        dob: childDob,
        gender: childGender
      })
      .select()
      .single()

    if (memberError) throw memberError
    memberId = member.id;

  } catch (err: any) {
    console.error('Signup profile creation error:', err)
    return { error: err.message ?? 'Failed to create your profile. Please contact support.' }
  }

  // 4. Redirect to enrollment with auto-advance to step 4
  if (nextPath) {
    const separator = nextPath.includes('?') ? '&' : '?'
    redirect(`${nextPath}${separator}memberId=${memberId}&autoStep=4`)
  }

  redirect('/customer/enroll')
}
