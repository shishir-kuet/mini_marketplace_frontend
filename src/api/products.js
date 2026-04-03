import api from './axios'

export const getAllProducts   = ()         => api.get('/products')
export const getProductById  = (id)        => api.get(`/products/${id}`)
export const getMyProducts   = ()          => api.get('/products/my')
export const searchProducts  = (title)     => api.get(`/products/search?title=${encodeURIComponent(title)}`)
export const getProductsBySeller = (sid)   => api.get(`/products/seller/${sid}`)
export const createProduct   = (data)      => api.post('/products', data)
export const updateProduct   = (id, data)  => api.put(`/products/${id}`, data)
export const deleteProduct   = (id)        => api.delete(`/products/${id}`)
