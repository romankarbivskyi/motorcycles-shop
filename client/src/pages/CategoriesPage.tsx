import { useCategories } from "../hooks/useCategories.ts";
import { useCallback, useEffect } from "react";
import CategoryList from "../components/CategoryList.tsx";

export default function CategoriesPage() {
  const { isLoading, error, categories, fetchCategories } = useCategories();

  const loadCategories = useCallback(async () => {
    await fetchCategories();
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  if (isLoading) return <div>Loading</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <CategoryList data={categories} />
    </div>
  );
}
