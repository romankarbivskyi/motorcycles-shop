import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductList from "../components/ProductList.tsx";
import Pagination from "../components/Pagination.tsx";
import { useProducts } from "../hooks/useProducts.ts";
import Search from "../components/Search.tsx";
import { ITEMS_PER_PAGE } from "../global/constants.ts";

export default function ProductsPage() {
  const { categoryId } = useParams<{
    categoryId: string;
  }>();

  const memoizedCategoryId = useMemo(
    () => parseInt(categoryId as string),
    [categoryId],
  );

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { isLoading, isError, data, refetch } = useProducts({
    params: {
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
      search,
    },
    categoryId: memoizedCategoryId,
  });

  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isError) return <div>Error!!!</div>;

  return (
    <div className="p-10">
      <Search
        onSearch={(search) => {
          setSearch(search);
          setCurrentPage(1);
        }}
      />

      {isLoading ? <div>Loading...</div> : null}
      {data?.products.length ? (
        <>
          <ProductList data={data.products} />
          <Pagination
            currentPage={currentPage}
            maxItems={data.count}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="m-10 text-center">Товарів не знайдено</div>
      )}
    </div>
  );
}
