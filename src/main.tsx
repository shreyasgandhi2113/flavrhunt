import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx';
import favicon from './assets/flavrhunt-logo.png';

// Set favicon dynamically to bundled asset (uses src/assets/flavrhunt-logo.png as single source)
const setFavicon = (href: string) => {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = href;
};

setFavicon(favicon);

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>
  );
}
