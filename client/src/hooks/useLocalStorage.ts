import { useEffect } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const setItem = (value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  const getItem = () => {
    try {
      const value = localStorage.getItem(key);
      return (JSON.parse(value) as T) || null;
    } catch (err) {
      console.log(err);
    }
  };

  const removeItem = () => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setItem(defaultValue);
  }, []);

  return { setItem, getItem, removeItem };
}
