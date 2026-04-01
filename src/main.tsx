import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './bootstrapRippleField';
import { App } from './App';

const rootEl = document.getElementById('react-root');
if (!rootEl) {
  throw new Error('Missing #react-root container');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
