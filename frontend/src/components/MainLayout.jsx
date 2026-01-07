import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('store');
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'store', label: '💾 Store', path: '/store' },
    { id: 'retrieve', label: '🔍 Retrieve', path: '/retrieve' },
    { id: 'share', label: '🔗 Share', path: '/share' },
    { id: 'ipfs', label: '🌐 IPFS', path: '/ipfs' },
    { id: 'devices', label: '📱 Devices', path: '/devices' },
    { id: 'analytics', label: '📊 Analytics', path: '/analytics' },
    { id: 'tor', label: '🔒 Tor', path: '/tor' },
    { id: 'privacy', label: '🛡️ Privacy', path: '/privacy' },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  // Set active tab based on current route
  React.useEffect(() => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname]);

  const isAuthenticated = localStorage.getItem('jwtToken') !== null;

  return (
    <div style={styles.layout}>
      <Header />
      <div style={styles.contentWrapper}>
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)',
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    padding: '20px',
    position: 'relative',
    zIndex: 2,
  },
  sidebar: {
    width: '250px',
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    padding: '20px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
    fontFamily: "'Share Tech Mono', monospace",
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tab: {
    padding: '14px 18px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '4px',
    fontSize: '0.9rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: '#00ff41',
    fontWeight: '400',
    fontFamily: "'Share Tech Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  activeTab: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.5), inset 0 0 10px rgba(0, 255, 65, 0.2)',
    textShadow: '0 0 10px #00ff41',
  },
  mainContent: {
    flex: 1,
    background: 'rgba(10, 10, 10, 0.85)',
    border: '1px solid #00ff41',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: `0 0 30px rgba(0, 255, 65, 0.3), 0 0 60px rgba(102, 126, 234, 0.2), inset 0 0 30px rgba(0, 255, 65, 0.05)`,
    minHeight: '600px',
    color: '#00ff41',
    fontFamily: "'Share Tech Mono', monospace",
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },
};

export default MainLayout;

