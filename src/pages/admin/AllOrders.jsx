import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders, completeOrder, deleteOrder } from '../../api/orders'
import Spinner from '../../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }) {
  const map = { pending: 'badge-pending', completed: 'badge-complete', cancelled: 'badge-cancelled' }
  return <span className={`badge ${map[status] || 'badge-cancelled'}`}>{status}</span>
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getAllOrders()
      .then(r => setOrders(r.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleComplete(id) {
    if (!window.confirm(`Mark order #${id} as completed?`)) return
    setActionId(id)
    try {
      const res = await completeOrder(id)
      setOrders(os => os.map(o => o.id === id ? res.data : o))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete order.')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Permanently delete order #${id}? This cannot be undone.`)) return
    setActionId(id)
    try {
      await deleteOrder(id)
      setOrders(os => os.filter(o => o.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete order.')
    } finally {
      setActionId(null)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>All Orders</h1>
          <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter Tabs */}
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' ? ' (' + orders.filter(o => o.status === s).length + ')' : ''}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No {filter !== 'all' ? filter : ''} orders</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`} className="font-semibold">#{order.id}</Link>
                    </td>
                    <td className="font-semibold">{order.buyerUsername}</td>
                    <td className="text-secondary text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td className="font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-secondary text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <div className="flex gap-8">
                        {order.status === 'pending' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleComplete(order.id)}
                            disabled={actionId === order.id}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(order.id)}
                          disabled={actionId === order.id}
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
