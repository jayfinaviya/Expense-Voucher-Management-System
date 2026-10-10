import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext';
import { App } from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
