import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PasswordGate } from '@/components/PasswordGate';
import { WelcomePage } from '@/pages/WelcomePage';
import { AppProvider } from '@/state/AppContext';
import { AppPage } from '@/pages/AppPage';

type View = 'gate' | 'app';
export default function App() {
  const [view, setView] = useState<View>('gate');
  if (view === 'gate') return <PasswordGate onSuccess={() => setView('app')} />;
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
