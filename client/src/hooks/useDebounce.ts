import { useEffect, useState } from "react";

interface UseDebounceProps<T> {
  value: T;
  delay?: number;
}

export const useDebounce = <T>({ value, delay }: UseDebounceProps<T>) => {
  const [debounceValue, setDebounceValue] = useState<T>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceValue(value);
    }, delay || 1000);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounceValue;
};
