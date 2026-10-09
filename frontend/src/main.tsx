import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const initialTheme = localStorage.getItem('opsmind_theme') || 'light-green';
document.documentElement.setAttribute('data-theme', initialTheme);
document.body.setAttribute('data-theme', initialTheme);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

