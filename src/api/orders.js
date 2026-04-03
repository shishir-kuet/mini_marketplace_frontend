import api from './axios'

export const placeOrder          = (data)         => api.post('/orders', data)
export const getMyOrders         = ()              => api.get('/orders/my')
export const getOrderById        = (id)            => api.get(`/orders/${id}`)
export const cancelOrder         = (id)            => api.put(`/orders/${id}/cancel`)
export const getSellerOrders     = ()              => api.get('/orders/seller-orders')
export const updateOrderStatus   = (id, status)    => api.put(`/orders/${id}/status`, { status })
export const getAllOrders         = ()              => api.get('/orders')
export const completeOrder       = (id)            => api.put(`/orders/${id}/complete`)
export const deleteOrder         = (id)            => api.delete(`/orders/${id}`)
