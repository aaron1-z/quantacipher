// Header.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('jwtToken');
      setIsAuthenticated(!!token);
    };
    
    // Check auth on mount
    checkAuth();
    
    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Listen for custom auth events (for same-tab updates)
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    // Dispatch custom event to update header
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <header className="Header">
      <div className="LogoContainer">
        <img src={logo} alt="Quantacipher Logo" className="LogoImage" />
        <h1 className="LogoText">Quantacipher</h1>
      </div>
      <nav className="NavLinks">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/anonymous" className={({ isActive }) => isActive ? 'active' : ''}>
              Go Anonymous
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
              Register
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
              Login
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
