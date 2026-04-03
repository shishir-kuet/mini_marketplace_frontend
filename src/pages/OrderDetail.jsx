import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getOrderById, cancelOrder } from '../api/orders'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }) {
  const map = { pending: 'badge-pending', completed: 'badge-complete', cancelled: 'badge-cancelled' }
  return <span className={`badge ${map[status] || 'badge-cancelled'}`}>{status}</span>
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    getOrderById(id)
      .then(r => setOrder(r.data))
      .catch(() => setError('Order not found or access denied.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!window.confirm('Cancel this order?')) return
    setCancelling(true)
    setCancelError('')
    try {
      const res = await cancelOrder(id)
      setOrder(res.data)
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Failed to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return (
    <div className="page"><div className="container">
      <div className="alert alert-error">{error}</div>
      <Link to="/my-orders" className="btn btn-secondary">← My Orders</Link>
    </div></div>
  )

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="mb-20">
          <Link to="/my-orders" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← My Orders
          </Link>
        </div>

        <div className="page-header flex-between gap-12" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1>Order #{order.id}</h1>
            <p>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {cancelError && <div className="alert alert-error">{cancelError}</div>}

        <div className="card mb-20">
          <div className="card-body">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Items</h2>
            {order.items.map(item => (
              <div key={item.id} className="order-item">
                <div>
                  <Link to={`/products/${item.productId}`} style={{ fontWeight: 500 }}>{item.productTitle}</Link>
                  <div className="text-muted text-sm">{formatPrice(item.price)} × {item.quantity}</div>
                </div>
                <span className="font-bold">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            <div style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '2px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 700,
            }}>
              <span>Order Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Order Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.875rem' }}>
              <div className="text-secondary">Buyer</div>
              <div className="font-semibold">{order.buyerUsername}</div>
              <div className="text-secondary">Status</div>
              <div><StatusBadge status={order.status} /></div>
              <div className="text-secondary">Order ID</div>
              <div className="font-semibold">#{order.id}</div>
            </div>
          </div>
        </div>

        {order.status === 'pending' && (
          <div className="mt-20">
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
