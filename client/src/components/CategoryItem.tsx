import { Category } from "../global/types.ts";
import { NavLink } from "react-router-dom";

interface CategoryItemProps {
  data?: Category;
}

export default function CategoryItem({
  data: { id, name, description },
}: CategoryItemProps) {
  return (
    <NavLink
      to={`/products/category/${id}`}
      key={id}
      className="border p-5 rounded hover:bg-gray-600/10"
    >
      <h3 className="font-medium">{name}</h3>
      <p className="text-sm">{description}</p>
    </NavLink>
  );
}
