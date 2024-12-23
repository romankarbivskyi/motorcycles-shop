import { useQuery } from "@tanstack/react-query";
import {
  fetchProductByID,
  fetchProducts,
  FetchProductsParams,
} from "../api/products.ts";

export interface UseProductsProps {
  params?: FetchProductsParams;
  categoryId?: number;
  search?: string;
}

export function useProducts({ params, categoryId }: UseProductsProps) {
  return useQuery({
    queryKey: ["products", params, categoryId],
    queryFn: async () => await fetchProducts(params, categoryId),
  });
}

export function useProduct(productId: number) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => await fetchProductByID(productId),
  });
}
