import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tailwindcss/tailwind.css';

// Prevent the browser from showing the PWA installation / Add to Home Screen prompt
window.addEventListener('beforeinstallprompt', (e: any) => {
  e.preventDefault();
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <App />
  </>
);

