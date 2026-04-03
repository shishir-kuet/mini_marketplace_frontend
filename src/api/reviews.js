import api from './axios'

export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`)
export const getProductReviewSummary = (productId) => api.get(`/reviews/product/${productId}/summary`)
export const getMyReviews = () => api.get('/reviews/my')

export const createReview = (data) => api.post('/reviews', data)
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)
