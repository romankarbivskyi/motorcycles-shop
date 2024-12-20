import { Category } from "../types/global.ts";
import CategoryItem from "./CategoryItem.tsx";

interface CategoryListProps {
  data?: Category[];
}

export default function CategoryList({ data }: CategoryListProps) {
  return (
    <div className="grid grid-cols-5 gap-5 p-10">
      {data?.map((category) => <CategoryItem data={category} />)}
    </div>
  );
}
