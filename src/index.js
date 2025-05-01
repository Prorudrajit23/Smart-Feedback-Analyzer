import { App } from './components/App.js';

// Render the App component to the root element
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  root.appendChild(App());
});