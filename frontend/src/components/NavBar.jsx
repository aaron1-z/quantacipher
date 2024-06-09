import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="NavBar"> 
      <NavLink 
        to="/" 
        activeClassName="active" 
      >
        Home
      </NavLink>
      <NavLink 
        to="/about" 
        activeClassName="active" 
      >
        About
      </NavLink>
      <NavLink 
        to="/store" 
        activeClassName="active" 
      >
        Store
      </NavLink>
      <NavLink 
        to="/retrieve" 
        activeClassName="active" 
      >
        Retrieve
      </NavLink>
    </nav>
  );
};

export default NavBar;
