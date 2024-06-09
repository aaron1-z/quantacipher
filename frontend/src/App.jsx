// App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Retrieve from './pages/Retrieve';
import Register from './pages/Register'; // Import Register component
import Login from './pages/Login'; // Import Login component
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <NavBar />
      <main className="MainContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/store" element={<Store />} />
          <Route path="/retrieve" element={<Retrieve />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
