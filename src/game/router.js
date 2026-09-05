import { useState, useEffect } from 'react';

export const ROUTES = {
  HOME: '/',
  LEADERBOARD: '/leaderboard',
};

/**
 * Navigates to a path updating window.history and triggering popstate.
 */
export function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  }
}

/**
 * Custom React hook returning the current pathname and updating on navigation.
 */
export function useRoute() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return currentPath;
}
