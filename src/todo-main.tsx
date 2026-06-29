import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TodoDetail } from './pages/TodoDetail';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TodoDetail />
  </StrictMode>,
);
