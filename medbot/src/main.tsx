import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './styles/globals.css';
import App from './App';

// Suppress non-actionable dev warnings & FBXLoader stack traces for Three.js and Clerk dev keys
const shouldFilter = (args: any[]) => {
  const fullText = args.map(a => {
    if (typeof a === 'string') return a;
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  }).join(' ');

  return (
    fullText.includes('ShininessExponent') ||
    fullText.includes('FBXLoader') ||
    fullText.includes('THREE.Clock') ||
    fullText.includes('skinning weights') ||
    fullText.includes('Clerk has been loaded with development keys')
  );
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (shouldFilter(args)) return;
  originalWarn.apply(console, args);
};

const originalError = console.error;
console.error = (...args: any[]) => {
  if (shouldFilter(args)) return;
  originalError.apply(console, args);
};

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aW50ZWdyYWwtdXJjaGluLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
