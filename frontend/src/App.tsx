import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './features/auth/store';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <Outlet />;
}

export default App;
