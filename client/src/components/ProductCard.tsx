import { ProductWithAssets } from "../global/types.ts";
import { NavLink } from "react-router-dom";

interface ProductCardProps {
  data: Pick<
    ProductWithAssets,
    "id" | "make" | "model" | "year" | "price" | "stockQuantity" | "images"
  >;
  key?: number;
}

export function ProductCard({
  data: { id, make, model, year, price, stockQuantity, images },
  key,
}: ProductCardProps) {
  const imageUrl =
    images?.length > 0
      ? `http://localhost:5000/static/${images[0].url}`
      : "/images.jpg";

  return (
    <NavLink
      key={key}
      to={`/products/${id}`}
      className="border p-4 rounded grid grid-rows-subgrid row-span-2 gap-4 hover:bg-gray-600/10"
    >
      <div className="flex justify-center items-center">
        <img
          src={imageUrl}
          alt={`Image of ${make} ${model} (${year})`}
          className="rounded object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/64";
          }}
        />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-medium">{`${make} ${model} (${year})`}</h3>
        <p className="text-gray-600">Ціна: ${price}</p>
        <p className="text-sm text-gray-500">
          Кількість: {stockQuantity > 0 ? stockQuantity : "Out of stock"}
        </p>
      </div>
    </NavLink>
  );
}
