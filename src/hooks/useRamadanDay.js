import { useState, useEffect } from 'react';
import { getSetting } from '../lib/db';

export function getRamadanDay(startDate) {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  // Zero out time components for accurate day diff
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(30, Math.max(1, diff));
}

export function useRamadanDay() {
  const [today, setToday] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSetting('ramadanStartDate').then((startDate) => {
      setToday(getRamadanDay(startDate));
      setLoaded(true);
    });
  }, []);

  return { today, loaded };
}
