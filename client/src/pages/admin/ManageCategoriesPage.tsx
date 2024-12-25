import { useCategories } from "../../hooks/useCategories.ts";
import DataTable from "../../components/DataTable.tsx";
import { deleteCategory } from "../../api/categories.ts";
import { useCallback, useState } from "react";
import { ITEMS_PER_PAGE } from "../../global/constants.ts";
import Pagination from "../../components/Pagination.tsx";
import { NavLink } from "react-router-dom";

export default function ManageCategoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoading, isError, data, refetch } = useCategories({
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
    { name: "Назва", key: "name" },
    { name: "Опис", key: "description" },
    {
      name: "Delete",
      key: "delete",
      render: (row: any) => (
        <button
          onClick={async () => {
            const { error } = await deleteCategory(row.id);
            if (error) {
              alert(error);
            } else {
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
          to={`/admin/categories/update/${row.id}`}
          onClick={async () => {}}
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
          to={"/admin/categories/create"}
          className="text-white bg-black rounded p-2"
        >
          Додати категорію
        </NavLink>
      </div>
      {isLoading ? <div>Loading...</div> : null}
      {data?.categories.length ? (
        <>
          <DataTable columns={columns} data={data.categories} />
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
