import { useState, useMemo, useEffect, useCallback } from "react";
import ProductList from "../components/ProductList.tsx";
import Pagination from "../components/Pagination.tsx";
import { useProducts } from "../hooks/useProducts.ts";
import Search from "../components/Search.tsx";
import { ITEMS_PER_PAGE } from "../global/constants.ts";
import { useCategories } from "../hooks/useCategories.ts";
import SortSelect from "../components/Sort.tsx";
import Filter from "../components/Filter.tsx";

export default function ProductsPage() {
  const [search, setSearch] = useState<string>("");
  const [sortPriceOption, setSortPriceOption] = useState<string>("expensive");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000000,
  });

  const [yearRange, setYearRange] = useState<{ min: number; max: number }>({
    min: 1900,
    max: new Date().getFullYear(),
  });

  const productsParams = useMemo(
    () => ({
      params: {
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        search,
        sortByPrice: sortPriceOption,
        priceMin: priceRange?.min || 0,
        priceMax: priceRange?.max || 1000000,
        yearMin: yearRange?.min || 1900,
        yearMax: yearRange?.max || new Date().getFullYear(),
      },
      categoryId: selectedCategoryId,
    }),
    [
      currentPage,
      search,
      sortPriceOption,
      selectedCategoryId,
      priceRange,
      yearRange,
    ],
  );

  const productsRes = useProducts(productsParams);
  const productsData = productsRes.data;

  const categoriesRes = useCategories({});
  const categoriesData = categoriesRes.data;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      setSelectedCategoryId(
        selectedId === "all" ? undefined : parseInt(selectedId, 10),
      );
    },
    [],
  );

  const categoryOptions = useMemo(
    () =>
      categoriesData?.categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      )),
    [categoriesData],
  );

  const handleFilterChange = (filters: {
    price: { min: number; max: number };
    year: { min: number; max: number };
  }) => {
    setPriceRange(filters.price);
    setYearRange(filters.year);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!productsRes.isLoading && !productsRes.isError) {
      productsRes.refetch();
    }
  }, [
    currentPage,
    search,
    sortPriceOption,
    selectedCategoryId,
    priceRange,
    yearRange,
    productsRes,
  ]);

  if (productsRes.isError) return <div>Error!!!</div>;
  if (categoriesRes.isError) return <div>Error!!!</div>;

  return (
    <div className="p-10">
      <div className="mx-auto w-[500px] mb-2">
        <Search
          onSearch={(search) => {
            setSearch(search);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="flex flex-col gap-5 col-span-1 col-start-1">
          <div>
            <label htmlFor="category" className="font-medium mb-2">
              Категорія:
            </label>
            <select
              id="category"
              onChange={handleCategoryChange}
              value={selectedCategoryId || ""}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="all">Усі</option>
              {categoryOptions}
            </select>
          </div>

          <SortSelect
            title="За ціною"
            options={[
              { key: "expensive", name: "Спочатку дорогі" },
              { key: "cheap", name: "Спочатку дешеві" },
            ]}
            selectedOption={sortPriceOption}
            onChange={setSortPriceOption}
          />

          <Filter
            priceRange={priceRange}
            yearRange={yearRange}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="col-start-2 col-span-4">
          {productsRes.isLoading ? <div>Loading...</div> : null}
          {productsData?.products.length ? (
            <>
              <ProductList data={productsData.products} />
              <Pagination
                currentPage={currentPage}
                maxItems={productsData.count}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="m-10 text-center">Товарів не знайдено</div>
          )}
        </div>
      </div>
    </div>
  );
}
