import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- updated import
import "bootstrap/dist/css/bootstrap.min.css";
import App from './App';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // <-- new API
root.render(<App />);
