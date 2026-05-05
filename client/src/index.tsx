import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#131d2e',
              color: '#e8eaf6',
              border: '1px solid rgba(79,110,247,0.3)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#131d2e' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#131d2e' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
