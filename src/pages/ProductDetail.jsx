import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById, deleteProduct } from '../api/products'
import { placeOrder } from '../api/orders'
import {
  getProductReviews,
  getProductReviewSummary,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

function formatPrice(n) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n)
}

function getReviewUsername(review) {
  return review.reviewerUsername || review.userUsername || review.username || review.user?.username || 'User'
}

function formatReviewDate(dateString) {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getErrorMessage(err, fallbackMessage) {
  return err.response?.data?.error || err.response?.data?.message || fallbackMessage
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

  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(true)
  const [reviewError, setReviewError] = useState('')

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewFormError, setReviewFormError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    getProductById(id)
      .then(r => setProduct(r.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    loadReviews()
  }, [id])

  async function loadReviews() {
    setReviewLoading(true)
    setReviewError('')
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        getProductReviews(id),
        getProductReviewSummary(id),
      ])
      setReviews(reviewsRes.data || [])
      setSummary(summaryRes.data || null)
    } catch (err) {
      setReviewError(getErrorMessage(err, 'Failed to load reviews.'))
    } finally {
      setReviewLoading(false)
    }
  }

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

  async function handleReviewSubmit(e) {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setSubmittingReview(true)
    setReviewFormError('')
    setReviewSuccess('')

    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, { rating, comment: comment.trim() })
        setReviewSuccess('Review updated successfully.')
      } else {
        await createReview({ productId: Number(id), rating, comment: comment.trim() })
        setReviewSuccess('Review submitted successfully.')
      }

      setComment('')
      setRating(5)
      setEditingReviewId(null)
      await loadReviews()
    } catch (err) {
      setReviewFormError(getErrorMessage(err, 'Failed to save review.'))
    } finally {
      setSubmittingReview(false)
    }
  }

  function startEditReview(review) {
    setEditingReviewId(review.id)
    setRating(review.rating || 5)
    setComment(review.comment || '')
    setReviewFormError('')
    setReviewSuccess('')
  }

  function cancelEditReview() {
    setEditingReviewId(null)
    setRating(5)
    setComment('')
    setReviewFormError('')
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(reviewId)
      if (editingReviewId === reviewId) cancelEditReview()
      await loadReviews()
    } catch (err) {
      setReviewFormError(getErrorMessage(err, 'Failed to delete review.'))
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
  const averageRating = summary?.averageRating ?? summary?.avgRating ?? 0
  const totalReviews = summary?.totalReviews ?? summary?.reviewCount ?? reviews.length

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
                <div className="review-summary-inline">
                  <strong>{Number(averageRating || 0).toFixed(1)}</strong>
                  <span> / 5</span>
                  <span className="text-secondary"> ({totalReviews} reviews)</span>
                </div>
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

            <div className="card mt-20">
              <div className="card-body">
                <div className="flex-between mb-12" style={{ alignItems: 'flex-end' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Customer Reviews</h2>
                  <span className="text-sm text-secondary">Average: {Number(averageRating || 0).toFixed(1)}/5</span>
                </div>

                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="review-form mb-20">
                    {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}
                    {(reviewFormError || reviewError) && <div className="alert alert-error">{reviewFormError || reviewError}</div>}

                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Your Rating</label>
                      <select
                        className="form-control"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        disabled={submittingReview}
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - Average</option>
                        <option value={2}>2 - Poor</option>
                        <option value={1}>1 - Bad</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Your Comment</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Share your experience about this product"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={submittingReview}
                      />
                    </div>

                    <div className="flex gap-8">
                      <button className="btn btn-primary" type="submit" disabled={submittingReview}>
                        {submittingReview ? 'Saving…' : editingReviewId ? 'Update Review' : 'Submit Review'}
                      </button>
                      {editingReviewId && (
                        <button className="btn btn-secondary" type="button" onClick={cancelEditReview} disabled={submittingReview}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="alert" style={{ background: '#f8f9fb', borderColor: 'var(--border)' }}>
                    <Link to="/login">Sign in</Link> to write a review.
                  </div>
                )}

                {reviewLoading ? (
                  <Spinner />
                ) : reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '28px 10px' }}>
                    <h3>No reviews yet</h3>
                    <p>Be the first one to review this product.</p>
                  </div>
                ) : (
                  <div className="review-list">
                    {reviews.map((review) => {
                      const reviewUsername = getReviewUsername(review)
                      const canManage = isAdmin || user?.username === reviewUsername

                      return (
                        <div key={review.id} className="review-item">
                          <div className="review-head">
                            <div>
                              <div className="review-user">{reviewUsername}</div>
                              <div className="review-date">{formatReviewDate(review.createdAt)}</div>
                            </div>
                            <div className="review-rating">{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</div>
                          </div>

                          {review.comment && <p className="review-comment">{review.comment}</p>}

                          {canManage && (
                            <div className="flex gap-8 mt-8">
                              <button className="btn btn-secondary btn-sm" onClick={() => startEditReview(review)}>
                                Edit
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReview(review.id)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
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
