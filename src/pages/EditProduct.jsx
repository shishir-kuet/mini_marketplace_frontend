import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById, updateProduct } from '../api/products'
import Spinner from '../components/Spinner'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', price: '', imageUrl: '', stockCount: '0' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProductById(id)
      .then(r => {
        const p = r.data
        setForm({ title: p.title, description: p.description, price: String(p.price), imageUrl: p.imageUrl || '', stockCount: String(p.stockCount ?? 0) })
      })
      .catch(() => setServerError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.price) errs.price = 'Price is required.'
    else if (isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Enter a valid positive price.'
    if (form.imageUrl && !/^https?:\/\//i.test(form.imageUrl)) errs.imageUrl = 'Must be a valid URL (http/https).'
    if (form.stockCount !== '' && (isNaN(form.stockCount) || Number(form.stockCount) < 0)) errs.stockCount = 'Stock must be 0 or greater.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await updateProduct(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        imageUrl: form.imageUrl.trim() || null,
        stockCount: form.stockCount !== '' ? parseInt(form.stockCount) : 0,
      })
      navigate(`/products/${id}`)
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to update listing.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="mb-20">
          <Link to={`/products/${id}`} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Back to listing
          </Link>
        </div>
        <div className="page-header">
          <h1>Edit Listing</h1>
          <p>Update your product details</p>
        </div>

        <div className="card">
          <div className="card-body">
            {serverError && <div className="alert alert-error">{serverError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input id="title" name="title" type="text" className="form-control" value={form.title} onChange={handleChange} />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-control" rows={4} value={form.description} onChange={handleChange} />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (BDT)</label>
                <input id="price" name="price" type="number" className="form-control" value={form.price} onChange={handleChange} min="0" step="0.01" />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="imageUrl">Image URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    value={form.imageUrl}
                    onChange={handleChange}
                  />
                  {errors.imageUrl && <p className="form-error">{errors.imageUrl}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="stockCount">Stock Count</label>
                  <input
                    id="stockCount"
                    name="stockCount"
                    type="number"
                    className="form-control"
                    value={form.stockCount}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />
                  {errors.stockCount && <p className="form-error">{errors.stockCount}</p>}
                </div>
              </div>

              <div className="flex gap-8 mt-8">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <Link to={`/products/${id}`} className="btn btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
