import { useState, useEffect } from 'react';
import { getTabCounts } from '@/lib/utils';

interface TabCounts {
  queue: number;
  receivals: number;
  tallies: number;
  devanning: number;
  unstuffed: number;
}

export const useTabCounts = () => {
  const [counts, setCounts] = useState<TabCounts>({
    queue: 0,
    receivals: 0,
    tallies: 0,
    devanning: 0,
    unstuffed: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      const newCounts = await getTabCounts();
      setCounts(newCounts);
    } catch (error) {
      console.error('Error fetching tab counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    
    // Listen for visibility change to refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCounts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { counts, loading, refreshCounts: fetchCounts };
};
