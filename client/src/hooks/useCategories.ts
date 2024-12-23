import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  FetchCategoriesParams,
  fetchCategory,
} from "../api/categories.ts";

interface UseCategoriesProps {
  params?: FetchCategoriesParams;
}

export function useCategories({ params }: UseCategoriesProps) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => await fetchCategories(params),
  });
}

export function useCategory(categoryId: number) {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => await fetchCategory(categoryId),
  });
}
