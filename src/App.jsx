import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'
import EditProduct from './pages/EditProduct'
import MyProducts from './pages/MyProducts'
import MyOrders from './pages/MyOrders'
import SellerOrders from './pages/SellerOrders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import AdminUsers from './pages/admin/Users'
import AdminOrders from './pages/admin/AllOrders'
import AdminCategories from './pages/admin/Categories'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/products/:id"   element={<ProductDetail />} />

          {/* Authenticated */}
          <Route path="/products/new"   element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
          <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/my-products"    element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />
          <Route path="/my-orders"      element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/seller-orders"  element={<ProtectedRoute><SellerOrders /></ProtectedRoute>} />
          <Route path="/orders/:id"     element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/users"      element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/orders"     element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin"            element={<Navigate to="/admin/users" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
