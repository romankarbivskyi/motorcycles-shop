import { useState } from "react";

interface UseLocalStorageArgs {
  key: string;
  defaultValue: string;
}

export const useLocalStorage = ({ key, defaultValue }: UseLocalStorageArgs) => {
  const [value, setValue] = useState<string>(defaultValue);
};
