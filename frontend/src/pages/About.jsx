import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main style={styles.page}>
      <div style={styles.heroSection}>
        <h1 style={styles.title}>Discover Quantacipher</h1>
        <p style={styles.subtitle}>
          Empowering individuals and businesses with innovative data security solutions.
        </p>
        <Link to="/register" style={styles.button}>Start Your Journey</Link>
      </div>
      <div style={styles.featuresSection}>
        <div style={styles.feature}>
          <i className="fas fa-lock" style={styles.icon}></i>
          <h3 style={styles.featureTitle}>Fortified Security</h3>
          <p style={styles.featureDescription}>
            Utilizing cutting-edge encryption technologies to protect your sensitive data.
          </p>
        </div>
        <div style={styles.feature}>
          <i className="fas fa-database" style={styles.icon}></i>
          <h3 style={styles.featureTitle}>Efficient Data Handling</h3>
          <p style={styles.featureDescription}>
            Streamlined processes for storing and retrieving information with ease.
          </p>
        </div>
        <div style={styles.feature}>
          <i className="fas fa-globe" style={styles.icon}></i>
          <h3 style={styles.featureTitle}>Global Accessibility</h3>
          <p style={styles.featureDescription}>
            Access your data securely from anywhere in the world, at any time.
          </p>
        </div>
      </div>
      <div style={styles.quoteSection}>
        <blockquote style={styles.quote}>
          "Where Information is Power and Your Privacy is our Priority "
        </blockquote>
        <p style={styles.quoteAuthor}>- Aditya Singh, Quantacipher</p>
      </div>
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
  quoteSection: {
    textAlign: 'center',
    marginTop: '50px',
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
  },
  quote: {
    fontStyle: 'italic',
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '20px',
  },
  quoteAuthor: {
    fontSize: '1rem',
    color: '#666',
  },
};

export default About;
