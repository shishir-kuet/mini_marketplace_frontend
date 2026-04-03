import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }
//test ruleset
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Mini Marketplace
        </Link>

        {/* Nav Links */}
        <ul className="navbar-nav" style={{ flex: 1 }}>
          <li><NavLink to="/" end>Products</NavLink></li>
          {isAuthenticated && (
            <>
              <li><NavLink to="/my-products">My Listings</NavLink></li>
              <li><NavLink to="/seller-orders">Seller Orders</NavLink></li>
              <li><NavLink to="/my-orders">My Orders</NavLink></li>
            </>
          )}
          {isAdmin && (
            <>
              <li><NavLink to="/admin/users">Users</NavLink></li>
              <li><NavLink to="/admin/orders">All Orders</NavLink></li>
              <li><NavLink to="/admin/categories">Categories</NavLink></li>
            </>
          )}
        </ul>

        {/* Right Side */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="nav-user">
              <span className={`nav-badge ${isAdmin ? 'admin' : 'user'}`}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
              <Link to="/profile" className="nav-user-name" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                {user.username}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
