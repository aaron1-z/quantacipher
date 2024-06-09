// src/pages/Retrieve.jsx

import React, { useState, useEffect } from 'react';
import axios from '../api';

const Retrieve = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/retrieve');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to retrieve data. Please try again later.'); // Improved error message
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/retrieve/${itemId}`);
      // After deletion, re-fetch the updated list
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item. Please try again.'); // Improved error message
    }
  };

  return (
    <main style={styles.page}>
      <h2 style={styles.title}>Retrieve Data</h2>
      {loading ? (
        <p style={styles.loading}>Loading data...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <ul style={styles.list}>
          {data.map((item) => (
            <li key={item.id} style={styles.item}> {/* Assuming 'id' is a unique identifier */}
              {item.name} {/* Display appropriate item property */}
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </li>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #ccc',
    fontSize: '1rem',
    color: '#333',
  },
};

export default Retrieve;
