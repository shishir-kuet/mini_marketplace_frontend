import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createProduct } from '../api/products'

export default function CreateProduct() {
  const [form, setForm] = useState({ title: '', description: '', price: '', imageUrl: '', stockCount: '0' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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

    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stockCount: form.stockCount !== '' ? parseInt(form.stockCount) : 0,
      }
      if (form.imageUrl.trim()) payload.imageUrl = form.imageUrl.trim()
      const res = await createProduct(payload)
      navigate(`/products/${res.data.id}`)
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="mb-20">
          <Link to="/my-products" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← My Listings
          </Link>
        </div>
        <div className="page-header">
          <h1>New Listing</h1>
          <p>Create a new product listing</p>
        </div>

        <div className="card">
          <div className="card-body">
            {serverError && <div className="alert alert-error">{serverError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Gaming Laptop"
                  value={form.title}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  placeholder="Describe the product in detail…"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (BDT)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 75000"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
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
                    placeholder="0"
                    value={form.stockCount}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />
                  {errors.stockCount && <p className="form-error">{errors.stockCount}</p>}
                </div>
              </div>

              <div className="flex gap-8 mt-8">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publishing…' : 'Publish Listing'}
                </button>
                <Link to="/my-products" className="btn btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
