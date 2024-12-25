import { ReactNode, useCallback, useState } from "react";
import { ITEMS_PER_PAGE } from "../../global/constants.ts";
import DataTable from "../../components/DataTable.tsx";
import Pagination from "../../components/Pagination.tsx";
import { useOrders } from "../../hooks/useOrders.ts";
import { OrderStatus } from "../../global/types.ts";
import { changeOrderStatus, deleteOrder } from "../../api/orders.ts";
import Modal from "../../components/Modal.tsx";
import OrderItem from "../../components/OrderItem.tsx";

export default function ManageOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>("");

  const { isLoading, isError, data, refetch } = useOrders({
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
    { name: "User Id", key: "userId" },
    { name: "Загальна ціна", key: "totalPrice" },
    {
      name: "Details",
      key: "details",
      render: (row: any) => (
        <button
          onClick={async () => {
            setModalContent(
              <div>
                <OrderItem
                  data={data?.orders?.find((attr) => attr.id === row.id)}
                />
              </div>,
            );
            setModalOpen(true);
          }}
          className="text-white bg-black p-2 rounded"
        >
          Деталі
        </button>
      ),
    },
    {
      name: "Delete",
      key: "delete",
      render: (row: any) => (
        <button
          onClick={async () => {
            const { error } = await deleteOrder(parseInt(row.id));
            if (error) alert(error);
            await refetch();
          }}
          className="text-white bg-red-500 p-2 rounded"
        >
          Видалити
        </button>
      ),
    },
    {
      name: "Update Status",
      key: "update",
      render: (row: any) => (
        <select
          onChange={async (e) => {
            const { error } = await changeOrderStatus(
              row.id,
              e.target.value as OrderStatus,
            );
            if (error) alert(error);
            await refetch();
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          {Object.values(OrderStatus).map((option) => (
            <option selected={row.status == option}>{option}</option>
          ))}
        </select>
      ),
    },
  ];

  if (isError) return <div>Error...</div>;

  return (
    <div>
      <div className="flex mb-2"></div>
      {isLoading ? <div>Loading...</div> : null}
      {data?.orders.length ? (
        <>
          <DataTable columns={columns} data={data.orders} />
          <Pagination
            currentPage={currentPage}
            maxItems={data.count}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </>
      ) : null}
      {isModalOpen && (
        <Modal title={"Деталі замовлення"} onClose={() => setModalOpen(false)}>
          {modalContent}
        </Modal>
      )}
    </div>
  );
}
