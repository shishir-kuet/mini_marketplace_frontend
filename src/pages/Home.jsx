import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllProducts, searchProducts } from '../api/products'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function fetchProducts(q = '') {
    setLoading(true)
    setError('')
    try {
      const res = q.trim() ? await searchProducts(q.trim()) : await getAllProducts()
      setProducts(res.data)
    } catch {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  function handleSearch(e) {
    e.preventDefault()
    fetchProducts(query)
  }

  function handleClear() {
    setQuery('')
    fetchProducts('')
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex-between gap-12" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1>All Products</h1>
            <p>{products.length} listing{products.length !== 1 ? 's' : ''} available</p>
          </div>
          <Link to="/products/new" className="btn btn-primary">
            + New Listing
          </Link>
        </div>

        {/* Search */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control"
            placeholder="Search products by title…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {query && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Clear
            </button>
          )}
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛍️</div>
            <h3>No products found</h3>
            <p>Try a different search term or be the first to list something.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-card">
                  <div className="product-card-img">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🏷️'
                    }
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-title">{p.title}</div>
                    <div className="product-card-desc">{p.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div className="product-seller">by {p.sellerUsername}</div>
                      {p.stockCount > 0
                        ? <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>In stock</span>
                        : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Out of stock</span>
                      }
                    </div>
                  </div>
                  <div className="product-card-footer">
                    <span className="product-price">{formatPrice(p.price)}</span>
                    <span style={{
                      fontSize: '0.78rem',
                      color: 'var(--accent)',
                      fontWeight: 500,
                    }}>View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
