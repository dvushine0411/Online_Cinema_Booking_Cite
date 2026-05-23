import { BrowserRouter } from 'react-router-dom';
import AppRouter from '@/router/index.tsx';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C1C2A',
            color: '#FFFFFF',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#D4AF37', secondary: '#0A0A0F' },
          },
          error: {
            iconTheme: { primary: '#E8192C', secondary: '#FFFFFF' },
          },
        }}
      />
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
