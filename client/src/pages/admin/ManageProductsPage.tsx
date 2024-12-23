import { useCallback, useState } from "react";
import { ITEMS_PER_PAGE } from "../../global/constants.ts";
import DataTable from "../../components/DataTable.tsx";
import Pagination from "../../components/Pagination.tsx";
import { useProducts } from "../../hooks/useProducts.ts";
import { NavLink } from "react-router-dom";
import { deleteProduct } from "../../api/products.ts";

export default function ManageProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoading, isError, data, refetch } = useProducts({
    params: {
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
    },
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
              alert("Товар видалено успішно");
              await refetch();
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

  if (isError) return <div>Error...</div>;

  return (
    <div>
      <div className="flex mb-2">
        <NavLink
          to={"/admin/products/create"}
          className="text-white bg-black rounded p-2"
        >
          Додати товар
        </NavLink>
      </div>
      {isLoading ? <div>Loading...</div> : null}
      {data?.products.length ? (
        <>
          <DataTable columns={columns} data={data.products} />
          <Pagination
            currentPage={currentPage}
            maxItems={data.count}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </>
      ) : null}
    </div>
  );
}
