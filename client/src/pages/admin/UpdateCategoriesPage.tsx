import { useParams } from "react-router-dom";
import CategoryForm from "../../components/CategoryForm.tsx";
import { useCategory } from "../../hooks/useCategories.ts";

export default function UpdateCategoriesPage() {
  const { categoryId } = useParams<{
    categoryId: string;
  }>();

  const { isLoading, isError, data } = useCategory(parseInt(categoryId!));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div>
      <CategoryForm type={"update"} categoryData={data} />
    </div>
  );
}
