import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories'
import Spinner from '../../components/Spinner'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create form
  const [newForm, setNewForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Edit
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [editSaving, setEditSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await getCategories()
      setCategories(res.data)
    } catch {
      setError('Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newForm.name.trim()) { setCreateError('Name is required.'); return }
    setCreating(true)
    setCreateError('')
    try {
      const res = await createCategory({ name: newForm.name.trim(), description: newForm.description.trim() })
      setCategories(cs => [...cs, res.data])
      setNewForm({ name: '', description: '' })
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create category.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(cat) {
    setEditId(cat.id)
    setEditForm({ name: cat.name, description: cat.description || '' })
  }

  async function handleEditSave(id) {
    if (!editForm.name.trim()) return
    setEditSaving(true)
    try {
      const res = await updateCategory(id, { name: editForm.name.trim(), description: editForm.description.trim() })
      setCategories(cs => cs.map(c => c.id === id ? res.data : c))
      setEditId(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update.')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    try {
      await deleteCategory(cat.id)
      setCategories(cs => cs.filter(c => c.id !== cat.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete category.')
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header">
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>

        {/* Create New */}
        <div className="card mb-20">
          <div className="card-body">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Add New Category</h2>
            {createError && <div className="alert alert-error">{createError}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name</label>
                  <input
                    type="text" className="form-control"
                    placeholder="e.g. Electronics"
                    value={newForm.name}
                    onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description <span className="text-muted">(optional)</span></label>
                  <input
                    type="text" className="form-control"
                    placeholder="Short description…"
                    value={newForm.description}
                    onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm mt-12" disabled={creating}>
                {creating ? 'Adding…' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? <Spinner /> : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <h3>No categories yet</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="text-muted text-sm">{cat.id}</td>
                    <td>
                      {editId === cat.id ? (
                        <input
                          type="text" className="form-control"
                          style={{ padding: '5px 8px', fontSize: '0.85rem' }}
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />
                      ) : (
                        <span className="font-semibold">{cat.name}</span>
                      )}
                    </td>
                    <td>
                      {editId === cat.id ? (
                        <input
                          type="text" className="form-control"
                          style={{ padding: '5px 8px', fontSize: '0.85rem' }}
                          value={editForm.description}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        />
                      ) : (
                        <span className="text-secondary text-sm">{cat.description || '—'}</span>
                      )}
                    </td>
                    <td className="text-secondary text-sm">
                      {new Date(cat.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      {editId === cat.id ? (
                        <div className="flex gap-8">
                          <button className="btn btn-primary btn-sm" onClick={() => handleEditSave(cat.id)} disabled={editSaving}>
                            {editSaving ? '…' : 'Save'}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-8">
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(cat)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)}>Delete</button>
                        </div>
                      )}
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
