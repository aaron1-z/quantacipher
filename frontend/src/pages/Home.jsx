// src/pages/Home.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main style={styles.page}>
      <div style={styles.heroSection}>
        <h1 style={styles.title}>Welcome to Quantacipher</h1>
        <p style={styles.subtitle}>Explore our secure data storage and retrieval solutions.</p>
        <Link to="/register" style={styles.button}>Get Started</Link>
      </div>
      <div style={styles.featuresSection}>
        <div style={styles.feature}>
          <i className="fas fa-lock" style={styles.icon}></i>
          <h3 style={styles.featureTitle}>Secure Storage</h3>
          <p style={styles.featureDescription}>Keep your sensitive data safe with our advanced encryption techniques.</p>
        </div>
        <div style={styles.feature}>
          <i className="fas fa-database" style={styles.icon}></i>
          <h3 style={styles.featureTitle}>Efficient Retrieval</h3>
          <p style={styles.featureDescription}>Quickly access your stored data whenever you need it, hassle-free.</p>
        </div>
        <div style={styles.feature}>
          <i className="fas fa-globe" style={styles.icon}></i>
          <h3 style={styles.featureTitle}>Global Access</h3>
          <p style={styles.featureDescription}>Access your data from anywhere in the world, securely and reliably.</p>
        </div>
      </div>
      {/* Removed the footer here */}
    </main>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '50px',
    minHeight: '100vh',
    background: '#f0f0f0',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: '3rem',
    color: '#333',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#666',
    marginBottom: '40px',
  },
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
    fontSize: '1.2rem',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  featuresSection: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '50px',
    width: '100%',
  },
  feature: {
    textAlign: 'center',
    width: '30%',
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  featureHover: {
    transform: 'translateY(-5px)',
  },
  icon: {
    fontSize: '3rem',
    color: '#007bff',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '10px',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#666',
  },
};

export default Home;
