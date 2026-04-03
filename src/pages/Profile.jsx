import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMe, updateMe } from '../api/users'
import Spinner from '../components/Spinner'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    getMe()
      .then(r => {
        setProfile(r.data)
        setForm({ email: r.data.email, password: '' })
      })
      .catch(() => setServerError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    setSuccessMsg('')
    const payload = {}
    if (form.email && form.email !== profile.email) payload.email = form.email
    if (form.password) payload.password = form.password
    if (Object.keys(payload).length === 0) {
      setSuccessMsg('No changes to save.')
      return
    }
    setSaving(true)
    try {
      const res = await updateMe(payload)
      setProfile(res.data)
      setForm({ email: res.data.email, password: '' })
      setSuccessMsg('Profile updated successfully.')
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="page-header">
          <h1>Profile</h1>
          <p>Manage your account details</p>
        </div>

        {/* Info Card */}
        <div className="card mb-20">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', fontSize: '0.875rem' }}>
              <div className="text-secondary">Username</div>
              <div className="font-semibold">{profile?.username}</div>
              <div className="text-secondary">Role</div>
              <div>
                <span className={`badge ${profile?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                  {profile?.role}
                </span>
              </div>
              <div className="text-secondary">Member since</div>
              <div className="text-secondary text-sm">
                {new Date(profile?.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 20 }}>Update Account</h2>

            {serverError && <div className="alert alert-error">{serverError}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">New password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Leave blank to keep current"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <p className="form-hint">Leave blank if you don't want to change your password.</p>
              </div>

              <button type="submit" className="btn btn-primary mt-4" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
