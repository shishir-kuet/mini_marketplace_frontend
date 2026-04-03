import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../api/orders'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }) {
  const map = { pending: 'badge-pending', completed: 'badge-complete', cancelled: 'badge-cancelled' }
  return <span className={`badge ${map[status] || 'badge-cancelled'}`}>{status}</span>
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? <Spinner /> : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>No orders yet</h3>
            <p><Link to="/">Browse products</Link> to get started.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="font-semibold text-sm">Order #{order.id}</span>
                  <span className="text-muted text-sm" style={{ marginLeft: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-8">
                  <StatusBadge status={order.status} />
                  <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                    Details
                  </Link>
                </div>
              </div>
              <div className="order-card-body">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <span>
                      <Link to={`/products/${item.productId}`}>{item.productTitle}</Link>
                      <span className="text-muted text-sm"> × {item.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                <div className="order-total">
                  Total: {formatPrice(order.totalAmount)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
