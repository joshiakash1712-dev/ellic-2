import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { VisualEditor } from '../tools/visual-editor';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {import.meta.env.DEV ? <VisualEditor /> : null}
  </StrictMode>,
);
