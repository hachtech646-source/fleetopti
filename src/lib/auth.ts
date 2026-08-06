import { supabase } from './supabase'

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  roleId: string,
  phone?: string,
  companyName?: string
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        role_id: roleId,
        company_name: companyName || null,
      },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Signup failed - no user returned.')

  const orgName = companyName?.trim() || `${fullName.trim()}'s Organization`

  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: orgName })
    .select('id')
    .single()

  if (orgError) throw orgError

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: authData.user.id,
        full_name: fullName,
        email,
        phone: phone || null,
        role_id: roleId,
        organization_id: orgData.id,
      },
      { onConflict: 'id' }
    )

  if (profileError) throw profileError

  return authData
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(id, name)')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}

export async function getCurrentOrganizationId(): Promise<string | null> {
  const profile = await getCurrentProfile()
  return profile?.organization_id ?? null
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
