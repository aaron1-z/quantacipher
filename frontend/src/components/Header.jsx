// Header.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

const Header = () => {
  return (
    <header className="Header">
      <div className="LogoContainer">
        <img src={logo} alt="Quantacipher Logo" className="LogoImage" />
        <h1 className="LogoText">Quantacipher</h1>
      </div>
      <nav className="NavLinks">
        <NavLink to="/register" activeClassName="active">Register</NavLink>
        <NavLink to="/login" activeClassName="active">Login</NavLink>
      </nav>
    </header>
  );
}

export default Header;
