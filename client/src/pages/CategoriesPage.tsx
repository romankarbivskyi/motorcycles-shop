import { useCategories } from "../hooks/useCategories.ts";
import CategoryList from "../components/CategoryList.tsx";

export default function CategoriesPage() {
  const { isLoading, isError, data } = useCategories({});

  if (isLoading) return <div>Loading</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      <CategoryList data={data?.categories} />
    </div>
  );
}
