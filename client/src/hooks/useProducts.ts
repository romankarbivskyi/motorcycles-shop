import { useEffect, useState } from "react";
import { Product } from "../types/global.ts";
import { API } from "../utils/api.ts";

export const useProducts = (productId?: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<Product | null>(null);

  useEffect(() => {
    setIsLoading(true);
    API.get(`/products/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err));
    setIsLoading(false);
  }, []);

  return { isLoading, error, data };
};
