import { Category, FetchPaginationParams } from "../global/types.ts";
import { API } from "../utils/api.ts";
import { CategoryInput } from "../components/CategoryForm.tsx";
import { handleFetch, HandleFetchResponse } from "../utils/handleFetch.ts";

export interface FetchCategoriesParams extends FetchPaginationParams {}

export const fetchCategories = async (
  params?: FetchCategoriesParams,
): Promise<{
  categories: Category[];
  count: number;
}> => {
  const { data: categoriesData } = await API.get<Category[]>("/categories", {
    params,
  } as any);

  const { data: countData } = await API.get<number>(`/categories/count`, {
    params,
  } as any);

  return { categories: categoriesData, count: countData } as {
    categories: Category[];
    count: number;
  };
};

export const deleteCategory = async (
  categoryId: string,
): Promise<HandleFetchResponse<any>> => {
  return handleFetch({
    fetch: async () => await API.delete(`/categories/${categoryId}`),
  });
};

export const fetchCategory = async (categoryId: number): Promise<Category> => {
  const { data } = await API.get<Category>(`/categories/${categoryId}`);
  return data as Category;
};

export const createCategory = async (
  categoryData: CategoryInput,
): Promise<HandleFetchResponse<Category>> => {
  return handleFetch<Category>({
    fetch: async () => await API.post<Category>("/categories", categoryData),
  });
};

export const updateCategory = async (
  categoryData: CategoryInput,
  categoryId: number,
): Promise<HandleFetchResponse<Category>> => {
  return handleFetch<Category>({
    fetch: async () =>
      await API.put<Category>(`/categories/${categoryId}`, categoryData),
  });
};
