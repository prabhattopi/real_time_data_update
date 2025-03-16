import { useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import MapComponent from './components/MapComponent';
import LoginForm from './components/LoginForm';
import LocationForm from './components/LocationForm';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const socket = useMemo(() => {
    if (!user?.token) return null;
    return io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token: user.token },
      transports: ['websocket']
    });
  }, [user?.token]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [locationsRes, usersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/locations`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        
        if (usersRes.ok) {
          const userData = await usersRes.json();
          setUser(userData);
        }
        
        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData);
        }
      } catch (error) {
        console.error('Initial data fetch error:', error);
      }
    };

    if (localStorage.getItem('token')) fetchInitialData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('locationUpdate', (newLocation) => {
      setLocations(prev => [newLocation, ...prev.filter(l => l._id !== newLocation._id)]);
    });

    socket.on('activeUsers', (users) => {
      setActiveUsers(users.filter(u => u.userId !== user?.userId));
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, user]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLocations([]);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {user ? (
          <>
            <header className="header">
              <div className="user-info">
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
              <div className="status-indicators">
                <div className="status-item">
                  🟢 {activeUsers.length} Active Users
                </div>
                <div className="status-item">
                  📍 {locations.length} Locations
                </div>
              </div>
            </header>
            
            <main className="main-content">
              <LocationForm userId={user.userId} socket={socket} />
              <MapComponent locations={locations} />
            </main>
          </>
        ) : (
          <div className="auth-wrapper">
            <LoginForm onLogin={handleLogin} />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;