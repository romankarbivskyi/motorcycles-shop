import ProductList from "../components/ProductList.tsx";
import { useProducts } from "../hooks/useProducts.ts";
import Pagination from "../components/Pagination.tsx";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { searchString } = useParams<{ searchString: string }>();
  console.log("category:", categoryId);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  const { products, productCount, isLoading, error, fetchProducts } =
    useProducts();

  const loadProducts = useCallback(() => {
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;
    fetchProducts({
      currentPage,
      itemsPerPage,
      categoryId: parsedCategoryId,
      search: searchString,
    });
  }, [searchString, currentPage, itemsPerPage, categoryId, fetchProducts]);

  useEffect(() => {
    loadProducts();
    console.log("loading products");
  }, [searchString, categoryId, currentPage, itemsPerPage, fetchProducts]);

  const onPageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage],
  );

  console.log("count", productCount);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!!!</div>;
  if (productCount === 0) return <div>No products found</div>;

  return (
    <div>
      <ProductList data={products} />
      <Pagination
        currentPage={currentPage}
        maxItems={productCount}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}
