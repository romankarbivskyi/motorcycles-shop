import { useCallback, useEffect, useState } from "react";
import { Category } from "../types/global.ts";
import { API } from "../utils/api.ts";

export function useCategories() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const categoryRes = await API.get(`/categories/`);
      setCategories(categoryRes.data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, categories, fetchCategories };
}
