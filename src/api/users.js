import api from './axios'

export const getMe         = ()          => api.get('/users/me')
export const updateMe      = (data)      => api.put('/users/me', data)
export const getAllUsers    = ()          => api.get('/users')
export const getUserById   = (id)        => api.get(`/users/${id}`)
export const changeRole    = (id, role)  => api.put(`/users/${id}/role`, { role })
export const deleteUser    = (id)        => api.delete(`/users/${id}`)
