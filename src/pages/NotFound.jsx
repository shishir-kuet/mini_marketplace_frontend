import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <div className="container">
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state-icon">404</div>
          <h3 style={{ fontSize: '1.2rem' }}>Page not found</h3>
          <p style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary">Go to Home</Link>
        </div>
      </div>
    </div>
  )
}
