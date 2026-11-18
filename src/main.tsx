import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './resume.css';
import { App } from './App';

const rootEl = document.getElementById('react-root');
if (!rootEl) {
  throw new Error('Missing #react-root container');
}

createRoot(rootEl).render(
  <StrictMode>
    <App page={rootEl.dataset.page === 'water' ? 'water' : 'portfolio'} />
  </StrictMode>,
);
