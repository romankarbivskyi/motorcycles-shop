import { useEffect, useState, useCallback } from "react";
import { ProductWithAssets } from "../types/global.ts";
import { API } from "../utils/api.ts";

export interface UpdateProductArgs {
  id: number;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  description?: string;
  stockQuantity?: number;
  deleteImages?: string;
  categoryId?: number;
  attributes?: string[];
  deleteAttributes?: string[];
}

export function useProducts() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductWithAssets[]>([]);
  const [product, setProduct] = useState<ProductWithAssets | null>(null);
  const [productCount, setProductCount] = useState<number>(0);

  const fetchProducts = useCallback(
    async ({
      currentPage,
      itemsPerPage,
      categoryId,
      search,
    }: {
      currentPage?: number;
      itemsPerPage?: number;
      categoryId?: number;
      search?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      const offset = (currentPage - 1) * itemsPerPage;

      try {
        const productRes = await API.get(
          `/products${categoryId ? "/category/" + categoryId : ""}${search ? `/search/${search}` : ""}${offset ? `?offset=${offset}&limit=${itemsPerPage}` : ""}`,
        );
        const countRes = await API.get(
          `/products/count${categoryId ? "/category/" + categoryId : ""}`,
        );
        setProducts(productRes.data);
        setProductCount(countRes.data);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchProductById = useCallback(async (productId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch product.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(
    async (newProduct: Omit<ProductWithAssets, "id">) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await API.post("/products/create", newProduct);
        setProducts((prev) => [...prev, response.data]);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateProduct = useCallback(
    async (updatedProduct: Partial<UpdateProductArgs>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await API.put(`/products/update/`, updatedProduct);
        const updatedProductData = response.data;
        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.id
              ? { ...product, ...updatedProductData }
              : product,
          ),
        );
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (productId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await API.delete(`/products/delete/${productId}`);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setProductCount((prev) => prev - 1);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    product,
    productCount,
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
