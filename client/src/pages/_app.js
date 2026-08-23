import '../styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <Component {...pageProps} />;
}
