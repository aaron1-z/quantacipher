// App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Retrieve from './pages/Retrieve';
import Register from './pages/Register';
import Login from './pages/Login';
import AnonymousAuth from './pages/AnonymousAuth';
import AnonymousShare from './pages/AnonymousShare';
import PrivacyDashboard from './pages/PrivacyDashboard';
import IPFSStorage from './pages/IPFSStorage';
import TorSettings from './pages/TorSettings';
import DeviceSync from './pages/DeviceSync';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/anonymous" element={<AnonymousAuth />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/devices" 
            element={
              <PrivateRoute>
                <DeviceSync />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/store" 
            element={
              <PrivateRoute>
                <Store />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/retrieve" 
            element={
              <PrivateRoute>
                <Retrieve />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/share" 
            element={
              <PrivateRoute>
                <AnonymousShare />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ipfs" 
            element={
              <PrivateRoute>
                <IPFSStorage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/devices" 
            element={
              <PrivateRoute>
                <DeviceSync />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tor" 
            element={
              <PrivateRoute>
                <TorSettings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/privacy" 
            element={
              <PrivateRoute>
                <PrivacyDashboard />
              </PrivateRoute>
            } 
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
