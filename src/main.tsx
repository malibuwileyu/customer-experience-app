/**
 * @fileoverview Application entry point that renders the root component
 * @module src/main
 * @description
 * This file serves as the entry point for the React application.
 * It renders the root App component into the DOM and sets up React's
 * strict mode for development best practices.
 */

import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
