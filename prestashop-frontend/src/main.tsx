import { createRoot } from 'react-dom/client'
import './index.css'
import { mainRoutes } from './routes/mainRoutes.ts';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/sonner.tsx';
import { LanguageProvider } from './providers/LanguageProvider.tsx';
import { DATABASE_LANGUAGE_ID, DATABASE_CURRENCY_ID } from './utils/lang.ts';
import { BackofficeAuthProvider } from './providers/BackofficeAuthProvider.tsx';
import { FrontofficeAuthProvider } from './providers/FrontofficeAuthProvider.tsx';

const router = createBrowserRouter(mainRoutes);

createRoot(document.getElementById('root')!).render(
  <>
    <Toaster position="top-right" />
    <LanguageProvider initialLanguageId={DATABASE_LANGUAGE_ID} initialCurrencyId={DATABASE_CURRENCY_ID}>
      <BackofficeAuthProvider>
        <FrontofficeAuthProvider>
          <RouterProvider router={router} />
        </FrontofficeAuthProvider>
      </BackofficeAuthProvider>
    </LanguageProvider>
  </>,
)
