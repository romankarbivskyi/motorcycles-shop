import { useCallback, useMemo, useState } from "react";
import { ITEMS_PER_PAGE } from "../../global/constants.ts";
import DataTable from "../../components/DataTable.tsx";
import Pagination from "../../components/Pagination.tsx";
import { useProducts } from "../../hooks/useProducts.ts";
import { NavLink } from "react-router-dom";
import { deleteProduct } from "../../api/products.ts";
import SortSelect from "../../components/Sort.tsx";
import Filter from "../../components/Filter.tsx";
import { useCategories } from "../../hooks/useCategories.ts";
import Search from "../../components/Search.tsx";

export default function ManageProductsPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
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

  const handleFilterChange = (filters: {
    price: { min: number; max: number };
    year: { min: number; max: number };
  }) => {
    setPriceRange(filters.price);
    setYearRange(filters.year);
    setCurrentPage(1);
  };

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

  const columns = [
    { name: "ID", key: "id" },
    { name: "Виробник", key: "make" },
    { name: "Модель", key: "model" },
    { name: "Рік", key: "year" },
    { name: "Ціна", key: "price" },
    { name: "Кількість", key: "stockQuantity" },
    {
      name: "Delete",
      key: "delete",
      render: (row: any) => (
        <button
          onClick={async () => {
            const { error } = await deleteProduct(row.id);
            if (error) {
              alert(`${error}`);
            } else {
              await productsRes.refetch();
            }
          }}
          className="text-white bg-red-500 p-2 rounded"
        >
          Видалити
        </button>
      ),
    },
    {
      name: "Update",
      key: "update",
      render: (row: any) => (
        <NavLink
          to={`/admin/products/update/${row.id}`}
          className="text-white bg-blue-500 p-2 rounded"
        >
          Оновити
        </NavLink>
      ),
    },
  ];

  if (productsRes.isError) return <div>Error...</div>;
  if (categoriesRes.isError) return <div>Error...</div>;

  return (
    <div>
      <div className="flex mb-2 gap-5 items-center">
        <NavLink
          to={"/admin/products/create"}
          className="text-white bg-black rounded p-2"
        >
          Додати товар
        </NavLink>
        <button
          className="text-white bg-black rounded p-2"
          onClick={() => setSearchOpen(!isSearchOpen)}
        >
          Розширений пошук
        </button>
      </div>
      <div className={`flex flex-col gap-5 ${!isSearchOpen && "hidden"}`}>
        <Search
          onSearch={(search) => {
            setSearch(search);
            setCurrentPage(1);
          }}
        />
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
      {productsRes.isLoading ? <div>Loading...</div> : null}
      {productsData?.products.length ? (
        <div>
          <DataTable columns={columns} data={productsData.products} />
          <Pagination
            currentPage={currentPage}
            maxItems={productsData.count}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      ) : null}
    </div>
  );
}
