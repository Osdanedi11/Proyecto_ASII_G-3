import { useEffect, useState } from 'react';

export function usePageReady(delay = 350) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), delay);

    return () => window.clearTimeout(timer);
  }, [delay]);

  return isReady;
}
