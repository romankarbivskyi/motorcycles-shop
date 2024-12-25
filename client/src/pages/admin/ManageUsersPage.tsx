import { useCallback, useState } from "react";
import { useUsers } from "../../hooks/useUsers.ts";
import { ITEMS_PER_PAGE } from "../../global/constants.ts";
import DataTable from "../../components/DataTable.tsx";
import Pagination from "../../components/Pagination.tsx";
import { deleteUser } from "../../api/users.ts";

export default function ManageUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoading, isError, data, refetch } = useUsers({
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
    { name: "Ім'я", key: "firstName" },
    { name: "Прізвище", key: "lastName" },
    { name: "Телефон", key: "phone" },
    { name: "E-mail", key: "email" },
    { name: "Роль", key: "role" },
    {
      name: "Delete",
      key: "delete",
      render: (row: any) => (
        <button
          onClick={async () => {
            const { error } = await deleteUser(parseInt(row.id));
            if (error) alert(error);
            await refetch();
          }}
          className="text-white bg-red-500 p-2 rounded"
        >
          Видалити
        </button>
      ),
    },
  ];

  if (isError) return <div>Error...</div>;

  return (
    <div>
      <div className="flex mb-2"></div>
      {isLoading ? <div>Loading...</div> : null}
      {data?.users.length ? (
        <>
          <DataTable columns={columns} data={data.users} />
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
