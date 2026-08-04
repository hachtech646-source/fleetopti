'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/lib/types'

export default function SignupPage() {
  const router = useRouter()

  const [roles, setRoles] = useState<Role[]>([])
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadRoles() {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (!error && data) {
        setRoles(data)
        if (data.length > 0) setRoleId(data[0].id)
      }
    }

    loadRoles()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!companyName.trim() || !fullName.trim() || !email.trim() || !password || !roleId) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      await signUp(
        email.trim(),
        password,
        fullName.trim(),
        roleId,
        phone.trim() || undefined,
        companyName.trim()
      )

      alert('Account created! Please check your email if confirmation is required, then log in.')
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Sign Up</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid #ccc',
          padding: '1.5rem',
          borderRadius: 8,
        }}
      >

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Company Name</label><br />
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Full name</label><br />
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Phone (optional)</label><br />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Role</label><br />
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            style={{ width: '100%' }}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <p style={{ marginTop: '1rem' }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  )
}