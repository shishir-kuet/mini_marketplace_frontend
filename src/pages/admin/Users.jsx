import { useState, useEffect } from 'react'
import { getAllUsers, changeRole, deleteUser } from '../../api/users'
import Spinner from '../../components/Spinner'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleLoading, setRoleLoading] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const res = await getAllUsers()
      setUsers(res.data)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleRoleToggle(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Change ${user.username}'s role to "${newRole}"?`)) return
    setRoleLoading(user.id)
    try {
      const res = await changeRole(user.id, newRole)
      setUsers(us => us.map(u => u.id === user.id ? { ...u, role: res.data.role } : u))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change role.')
    } finally {
      setRoleLoading(null)
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    try {
      await deleteUser(user.id)
      setUsers(us => us.filter(u => u.id !== user.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.')
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <p>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? <Spinner /> : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="text-muted text-sm">{u.id}</td>
                    <td className="font-semibold">{u.username}</td>
                    <td className="text-secondary text-sm">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-secondary text-sm">
                      {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRoleToggle(u)}
                          disabled={roleLoading === u.id}
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
