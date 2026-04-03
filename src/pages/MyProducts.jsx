import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyProducts, deleteProduct } from '../api/products'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

export default function MyProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    try {
      const res = await getMyProducts()
      setProducts(res.data)
    } catch {
      setError('Failed to load your listings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteProduct(id)
      setProducts(ps => ps.filter(p => p.id !== id))
    } catch {
      alert('Failed to delete product.')
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between gap-12" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1>My Listings</h1>
            <p>{products.length} product{products.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/products/new" className="btn btn-primary">+ New Listing</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? <Spinner /> : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No listings yet</h3>
            <p>
              <Link to="/products/new">Create your first listing</Link>
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Listed on</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/products/${p.id}`} style={{ fontWeight: 500 }}>{p.title}</Link>
                    </td>
                    <td className="font-semibold">{formatPrice(p.price)}</td>
                    <td>
                      {p.stockCount > 0
                        ? <span className="badge badge-complete">{p.stockCount}</span>
                        : <span className="badge badge-cancelled">0</span>}
                    </td>
                    <td className="text-secondary text-sm">
                      {new Date(p.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <Link to={`/products/${p.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.title)}>
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
