// src/pages/Retrieve.jsx

import React, { useState, useEffect } from 'react';
import axios from '../api';

const Retrieve = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKey, setSearchKey] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (key = '') => {
    setLoading(true);
    setError('');
    try {
      const url = key 
        ? `/retrieve/retrieve?key=${encodeURIComponent(key)}`
        : '/retrieve/retrieve';
      const response = await axios.get(url);
      if (response.data.success) {
        setData(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to retrieve data. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(searchKey);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      await axios.delete(`/retrieve/${itemId}`);
      // After deletion, re-fetch the updated list
      fetchData(searchKey);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error.response?.data?.message || 'Failed to delete item. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Retrieve Data</h2>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search by key (leave empty for all)"
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>Search</button>
        {searchKey && (
          <button 
            type="button" 
            onClick={() => {
              setSearchKey('');
              fetchData();
            }} 
            style={styles.clearButton}
          >
            Clear
          </button>
        )}
      </form>
      {error && <p style={styles.error}>{error}</p>}
      {loading ? (
        <p style={styles.loading}>Loading data...</p>
      ) : data.length === 0 ? (
        <p style={styles.empty}>No data found</p>
      ) : (
        <ul style={styles.list}>
          {data.map((item) => (
            <li key={item.id || item._id} style={styles.item}>
              <div style={styles.itemContent}>
                <strong style={styles.key}>{item.key || '[Encrypted Key]'}:</strong>
                <span style={styles.value}>{item.value || '[Encrypted Value]'}</span>
                {item.createdAt && (
                  <span style={styles.date}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleDelete(item.id || item._id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    color: '#00ff41',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41',
    fontFamily: "'Orbitron', monospace",
    fontWeight: '700',
    letterSpacing: '2px',
  },
  searchForm: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #00ff41',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff41',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
  },
  searchButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3), 0 0 30px rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s',
  },
  clearButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#00ff41',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s',
  },
  loading: {
    fontSize: '1rem',
    color: '#00ff41',
    textShadow: '0 0 5px #00ff41',
    fontFamily: "'Share Tech Mono', monospace",
  },
  error: {
    fontSize: '1rem',
    color: '#ff0040',
    marginBottom: '10px',
    textShadow: '0 0 10px #ff0040',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px',
    background: 'rgba(255, 0, 64, 0.1)',
    border: '1px solid #ff0040',
    borderRadius: '4px',
  },
  empty: {
    fontSize: '1rem',
    color: 'rgba(0, 255, 65, 0.6)',
    textAlign: 'center',
    padding: '20px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: '20px 0',
    width: '100%',
    maxWidth: '600px',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.7) 0%, rgba(26, 10, 46, 0.5) 50%, rgba(10, 10, 10, 0.7) 100%)',
    border: '1px solid #00ff41',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), 0 0 40px rgba(102, 126, 234, 0.15)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.3)',
    fontSize: '1rem',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
    transition: 'all 0.3s',
  },
  itemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  key: {
    color: '#00ff41',
    fontSize: '0.9rem',
    textShadow: '0 0 5px #00ff41',
    fontWeight: '600',
  },
  value: {
    color: 'rgba(0, 255, 65, 0.9)',
    wordBreak: 'break-word',
  },
  date: {
    fontSize: '0.8rem',
    color: 'rgba(0, 255, 65, 0.6)',
    marginTop: '5px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ff0040',
    border: '1px solid #ff0040',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginLeft: '15px',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s',
    textShadow: '0 0 5px #ff0040',
  },
};

export default Retrieve;
