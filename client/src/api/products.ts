import { ProductWithAssets } from "../global/types.ts";
import { API } from "../utils/api.ts";
import { ProductInput } from "../components/ProductForm.tsx";
import { handleFetch, HandleFetchResponse } from "../utils/handleFetch.ts";

export interface FetchProductsParams {
  offset?: number;
  limit?: number;
  sortByPrice?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  search?: string;
}

export const fetchProducts = async (
  params?: FetchProductsParams,
  categoryId?: number,
): Promise<{ products: ProductWithAssets[]; count: number }> => {
  const { data: productsData } = await API.get<ProductWithAssets[]>(
    `/products${categoryId ? `/category/${categoryId}` : ""}`,
    { params } as any,
  );

  const { data: countData } = await API.get<number>(
    `/products/count${categoryId ? `/category/${categoryId}` : ""}`,
    { params } as any,
  );

  return { products: productsData, count: countData } as {
    products: ProductWithAssets[];
    count: number;
  };
};

export const fetchProductByID = async (
  id: number,
): Promise<ProductWithAssets> => {
  const { data } = await API.get<ProductWithAssets>(`/products/${id}`);
  return data as ProductWithAssets;
};

export const createProduct = async (
  productData: ProductInput,
): Promise<HandleFetchResponse<ProductWithAssets>> => {
  const formData = new FormData();

  formData.append("make", productData.make);
  formData.append("model", productData.model);
  formData.append("year", productData.year.toString());
  formData.append("price", productData.price.toString());
  formData.append("description", productData.description);
  formData.append("stockQuantity", productData.stockQuantity.toString());
  formData.append("categoryId", productData.categoryId.toString());

  Array.from(productData.images).forEach((image) => {
    formData.append("images", image);
  });

  productData.attributes.forEach((attribute, index) => {
    formData.append(`attributes[${index}][name]`, attribute.name);
    formData.append(`attributes[${index}][value]`, attribute.value);
  });

  return handleFetch({
    fetch: async () =>
      await API.post<ProductWithAssets>("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      } as any),
  });
};

export const updateProduct = async (
  productData: ProductInput,
  productId: number,
): Promise<HandleFetchResponse<ProductWithAssets>> => {
  const formData = new FormData();

  formData.append("make", productData.make);
  formData.append("model", productData.model);
  formData.append("year", productData.year.toString());
  formData.append("price", productData.price.toString());
  formData.append("description", productData.description);
  formData.append("stockQuantity", productData.stockQuantity.toString());
  formData.append("categoryId", productData.categoryId.toString());

  Array.from(productData.images).forEach((image) => {
    formData.append("images", image);
  });

  productData.deleteImages?.forEach((imageUrl, index) => {
    formData.append(`deleteImages[${index}]`, imageUrl);
  });

  productData.attributes.forEach((attribute, index) => {
    formData.append(`attributes[${index}][name]`, attribute.name);
    formData.append(`attributes[${index}][value]`, attribute.value);
  });

  productData.deleteAttributes?.forEach((attributeName, index) => {
    formData.append(`deleteAttributes[${index}]`, attributeName);
  });

  return handleFetch({
    fetch: async () =>
      await API.put<ProductWithAssets>(`/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      } as any),
  });
};

export const deleteProduct = async (productId: number) => {
  return handleFetch({
    fetch: async () => await API.delete(`/products/${productId}`),
  });
};
