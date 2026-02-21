import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress the benign "ResizeObserver loop" error that browsers fire when an
// observer callback can't deliver every notification in a single animation frame.
// This is a known browser quirk (not an app bug) and the CRA dev overlay treats
// it as an unhandled error, blocking the entire page.
const RESIZE_OBSERVER_MSG = 'ResizeObserver loop';
const origError = window.onerror;
window.onerror = (message, ...args) => {
  if (typeof message === 'string' && message.includes(RESIZE_OBSERVER_MSG)) {
    return true;            // swallow the error
  }
  return origError ? origError(message, ...args) : false;
};
window.addEventListener('error', (e) => {
  if (e.message?.includes(RESIZE_OBSERVER_MSG)) {
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
