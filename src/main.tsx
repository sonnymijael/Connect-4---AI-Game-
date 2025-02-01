import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import Fonts from './components/fonts.tsx';

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Fonts />
		<App />
	</React.StrictMode>
);
