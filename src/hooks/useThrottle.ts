import { useEffect, useRef, useState } from "react";

export default function useThrottle<T>(value: T, delay: number) {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastUpdated.current;

    if (timeElapsed >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - timeElapsed);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}
