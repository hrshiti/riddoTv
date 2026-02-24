import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// SAFEHOUSE: Prevent "removeChild" errors from crashing the app
// This commonly happens when Google Translate or other extensions modify the DOM
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function (child) {
  if (child.parentNode !== this) {
    console.warn('Igoring removeChild error: The node to be removed is not a child of this node.');
    return child;
  }
  return originalRemoveChild.apply(this, arguments);
};

// Also patch insertBefore to be safe
const originalInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function (newNode, referenceNode) {
  if (referenceNode && referenceNode.parentNode !== this) {
    console.warn('Ignoring insertBefore error: The reference node is not a child of this node.');
    if (referenceNode instanceof Node) {
      return originalInsertBefore.apply(this, [newNode, null]); // Append to end instead
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]);
  }
  return originalInsertBefore.apply(this, arguments);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
