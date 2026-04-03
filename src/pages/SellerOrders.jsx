import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSellerOrders, updateOrderStatus } from '../api/orders'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

const STATUS_COLOR = {
  pending:    'badge-pending',
  processing: 'badge-pending',
  shipped:    'badge-admin',
  delivered:  'badge-complete',
  completed:  'badge-complete',
  cancelled:  'badge-cancelled',
}

// Allowed next statuses a seller can set (per API spec)
const SELLER_ALLOWED = ['processing', 'shipped', 'delivered', 'cancelled']

function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_COLOR[status] || 'badge-cancelled'}`}>{status}</span>
}

function StatusUpdater({ order, isAdmin, onUpdated }) {
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isTerminal = order.status === 'cancelled' || order.status === 'completed'
  if (isTerminal) return <span className="text-muted text-sm">—</span>

  const options = SELLER_ALLOWED

  async function handleUpdate() {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const res = await updateOrderStatus(order.id, selected)
      onUpdated(res.data)
      setSelected('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="flex gap-8">
        <select
          className="form-control"
          style={{ padding: '4px 8px', fontSize: '0.8rem', width: 140 }}
          value={selected}
          onChange={e => { setSelected(e.target.value); setError('') }}
        >
          <option value="">Set status…</option>
          {options.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleUpdate}
          disabled={!selected || saving}
        >
          {saving ? '…' : 'Update'}
        </button>
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

export default function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getSellerOrders()
      .then(r => setOrders(r.data))
      .catch(() => setError('Failed to load seller orders.'))
      .finally(() => setLoading(false))
  }, [])

  function handleUpdated(updatedOrder) {
    setOrders(os => os.map(o => o.id === updatedOrder.id ? updatedOrder : o))
  }

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed']
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Seller Orders</h1>
          <p>Orders containing your products — {orders.length} total</p>
        </div>

        {/* Filter tabs */}
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button
              key={s}
              className={`tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && ` (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No {filter !== 'all' ? filter : ''} orders</h3>
            <p>Orders for your products will appear here.</p>
          </div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="flex gap-12" style={{ alignItems: 'center' }}>
                  <span className="font-semibold">Order #{order.id}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    by <strong>{order.buyerUsername}</strong>
                  </span>
                  <span className="text-muted text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-8" style={{ alignItems: 'center' }}>
                  <StatusBadge status={order.status} />
                  <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View</Link>
                </div>
              </div>

              <div className="order-card-body">
                {/* Items */}
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <span>
                      <Link to={`/products/${item.productId}`} style={{ fontWeight: 500 }}>{item.productTitle}</Link>
                      <span className="text-muted text-sm"> × {item.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                <div className="order-total">Total: {formatPrice(order.totalAmount)}</div>

                {/* Status updater */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginRight: 12 }}>
                    Update status:
                  </span>
                  <StatusUpdater order={order} onUpdated={handleUpdated} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
