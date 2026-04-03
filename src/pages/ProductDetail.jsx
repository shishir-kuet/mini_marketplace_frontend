import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById, deleteProduct } from '../api/products'
import { placeOrder } from '../api/orders'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

export default function ProductDetail() {
  const { id } = useParams()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [ordering, setOrdering] = useState(false)
  const [orderMsg, setOrderMsg] = useState('')
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    getProductById(id)
      .then(r => setProduct(r.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleOrder() {
    if (!isAuthenticated) { navigate('/login'); return }
    setOrdering(true)
    setOrderError('')
    setOrderMsg('')
    try {
      await placeOrder({ items: [{ productId: product.id, quantity: qty }] })
      setOrderMsg('Order placed successfully!')
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Failed to place order.')
    } finally {
      setOrdering(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return
    try {
      await deleteProduct(id)
      navigate('/my-products')
    } catch {
      alert('Failed to delete product.')
    }
  }

  if (loading) return <Spinner />
  if (error) return (
    <div className="page"><div className="container">
      <div className="alert alert-error">{error}</div>
      <Link to="/" className="btn btn-secondary">← Back to listings</Link>
    </div></div>
  )

  const isOwner = user?.username === product.sellerUsername
  const canBuy  = isAuthenticated && !isOwner

  return (
    <div className="page">
      <div className="container">
        <div className="mb-20">
          <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Back to listings
          </Link>
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div>
            <div className="detail-img">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
              : '🏷️'
            }
          </div>
            <div className="card">
              <div className="card-body">
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>{product.title}</h1>
                <p className="detail-meta">Listed by <strong>{product.sellerUsername}</strong></p>
                <p className="detail-meta" style={{ marginBottom: 16 }}>
                  {new Date(product.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {product.stockCount > 0 ? (
                  <span className="badge badge-complete" style={{ marginBottom: 12, display: 'inline-block' }}>In Stock ({product.stockCount})</span>
                ) : (
                  <span className="badge badge-cancelled" style={{ marginBottom: 12, display: 'inline-block' }}>Out of Stock</span>
                )}
                <hr className="divider" />
                <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right — Purchase Panel */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div className="card-body">
                <div className="detail-price">{formatPrice(product.price)}</div>

                {orderMsg && <div className="alert alert-success">{orderMsg}</div>}
                {orderError && <div className="alert alert-error">{orderError}</div>}

                {canBuy && !orderMsg && product.stockCount > 0 && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        value={qty}
                        onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    <div className="flex-between mb-12" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>Total</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatPrice(product.price * qty)}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-full btn-lg"
                      onClick={handleOrder}
                      disabled={ordering}
                    >
                      {ordering ? 'Placing order…' : 'Place Order'}
                    </button>
                  </>
                )}

                {canBuy && product.stockCount === 0 && !orderMsg && (
                  <div className="alert alert-error" style={{ marginBottom: 0 }}>This product is currently out of stock.</div>
                )}

                {!isAuthenticated && (
                  <Link to="/login" className="btn btn-primary btn-full btn-lg">
                    Sign in to purchase
                  </Link>
                )}

                {isOwner && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to={`/products/${id}/edit`} className="btn btn-secondary btn-full">
                      Edit listing
                    </Link>
                    <button className="btn btn-danger btn-full" onClick={handleDelete}>
                      Delete listing
                    </button>
                  </div>
                )}

                {isAdmin && !isOwner && (
                  <button className="btn btn-danger btn-full mt-8" onClick={handleDelete}>
                    Delete (Admin)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
