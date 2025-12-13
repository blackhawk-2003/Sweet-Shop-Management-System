import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🍬</span>
          <span className="brand-text">Sweet Shop</span>
        </Link>

        <div className="navbar-links">
          {user && (
            <>
              <Link to="/dashboard" className="nav-link">
                Home
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="nav-link">
                  Admin Panel
                </Link>
              )}
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

