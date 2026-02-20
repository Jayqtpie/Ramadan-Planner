import { useState, useEffect, useRef, useCallback } from 'react';
import { getData, setData } from '../lib/db';

export function useAutoSave(store, id, defaultValue) {
  const [data, setLocalData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef(null);
  const savedTimerRef = useRef(null);
  const lastShownRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getData(store, id).then((result) => {
      if (!cancelled) {
        setLocalData(result || (typeof defaultValue === 'function' ? defaultValue() : defaultValue));
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [store, id]);

  const update = useCallback((updater) => {
    setLocalData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setData(store, next).then(() => {
          const now = Date.now();
          if (now - lastShownRef.current > 4000) {
            lastShownRef.current = now;
            setShowSaved(true);
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
            savedTimerRef.current = setTimeout(() => setShowSaved(false), 1300);
          }
        });
      }, 500);
      return next;
    });
  }, [store]);

  return { data, update, loaded, showSaved };
}
