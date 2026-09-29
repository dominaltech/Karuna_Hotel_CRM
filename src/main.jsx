import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Set default zoom level to 80%
if (typeof document !== 'undefined') {
  document.documentElement.style.zoom = '80%';
}

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

// Disable inspect element & devtools shortcut keys
document.addEventListener('keydown', (e) => {
  // F12
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  // Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + Shift + C
  if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  // Ctrl + U (View Source)
  if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
