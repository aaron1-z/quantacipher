// src/pages/Store.jsx

import React, { useState, useEffect } from 'react';
import axios from '../api';

const Store = () => {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/data'); // Replace with your API endpoint
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleAddItem = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/data', { item: newItem }); // Replace with your API endpoint
      setData([...data, response.data]);
      setNewItem('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item');
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Data Store</h2>
      <form onSubmit={handleAddItem} style={styles.form}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="New Item"
          style={styles.input}
          required
        />
        <button type="submit" style={isSubmitting ? styles.buttonSubmitting : styles.button}>
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>
      {loading ? (
        <p style={styles.loading}>Loading data...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <ul style={styles.list}>
          {data.map((item, index) => (
            <li key={index} style={styles.item}>{item}</li>
          ))}
        </ul>
      )}
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
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonSubmitting: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  loading: {
    fontSize: '1rem',
    color: '#666',
  },
  error: {
    fontSize: '1rem',
    color: 'red',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: '20px 0',
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  item: {
    padding: '15px',
    borderBottom: '1px solid #ccc',
    fontSize: '1rem',
    color: '#333',
  },
};

export default Store;
