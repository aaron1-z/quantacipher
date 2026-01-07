import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={styles.container}>
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
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    color: '#00ff41',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '50px',
    padding: '20px',
  },
  title: {
    fontSize: '3rem',
    color: '#00ff41',
    marginBottom: '20px',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '3px',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: 'rgba(0, 255, 65, 0.9)',
    marginBottom: '40px',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  button: {
    display: 'inline-block',
    padding: '14px 28px',
    backgroundColor: 'transparent',
    color: '#00ff41',
    textDecoration: 'none',
    borderRadius: '4px',
    border: '2px solid #00ff41',
    transition: 'all 0.3s',
    fontSize: '1rem',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '2px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
    textShadow: '0 0 10px #00ff41',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  featuresSection: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '50px',
    width: '100%',
    flexWrap: 'wrap',
    gap: '20px',
  },
  feature: {
    textAlign: 'center',
    width: '30%',
    minWidth: '250px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    padding: '30px',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)',
    transition: 'all 0.3s ease',
  },
  featureHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.4), inset 0 0 20px rgba(0, 255, 65, 0.1)',
  },
  icon: {
    fontSize: '3rem',
    color: '#00ff41',
    marginBottom: '20px',
    filter: 'drop-shadow(0 0 10px #00ff41)',
  },
  featureTitle: {
    fontSize: '1.5rem',
    color: '#00ff41',
    marginBottom: '10px',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '600',
    letterSpacing: '1px',
  },
  featureDescription: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
    lineHeight: '1.6',
  },
  quoteSection: {
    textAlign: 'center',
    marginTop: '50px',
    padding: '30px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
    maxWidth: '600px',
    margin: '50px auto 0',
  },
  quote: {
    fontStyle: 'italic',
    fontSize: '1.5rem',
    color: '#00ff41',
    marginBottom: '20px',
    textShadow: '0 0 10px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  quoteAuthor: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.8)',
    fontFamily: "'Share Tech Mono', monospace",
  },
};

export default About;
