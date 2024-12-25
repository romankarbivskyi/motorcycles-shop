import { useCallback, useState } from "react";
import { ITEMS_PER_PAGE } from "../../global/constants.ts";
import DataTable from "../../components/DataTable.tsx";
import Pagination from "../../components/Pagination.tsx";
import { useReviews } from "../../hooks/useReviews.ts";
import Search from "../../components/Search.tsx";
import { deleteReview } from "../../api/reviews.ts";

export default function ManageReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [productId, setProductId] = useState<number | undefined>(undefined);

  const { isLoading, isError, data, refetch } = useReviews({
    params: {
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
    },
    productId,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const columns = [
    { name: "ID", key: "id" },
    { name: "User ID", key: "userId" },
    { name: "Product ID", key: "productId" },
    { name: "Ім'я", key: "firstName" },
    { name: "Прізвище", key: "lastName" },
    { name: "Рейтинг", key: "rating" },
    { name: "Коментарій", key: "comment" },
    {
      name: "Delete",
      key: "delete",
      render: (row: any) => (
        <button
          onClick={async () => {
            const { error } = await deleteReview(parseInt(row.id));
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
      <div className="mb-2">
        <h2 className="text-xl">Product Id:</h2>
        <Search
          onSearch={(search) => {
            setProductId(parseInt(search));
          }}
        />
      </div>
      {isLoading ? <div>Loading...</div> : null}
      {data?.reviews.length ? (
        <>
          <DataTable columns={columns} data={data.reviews} />
          <Pagination
            currentPage={currentPage}
            maxItems={data.count}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="p-10 text-center">Відгуків не знайдено</div>
      )}
    </div>
  );
}
