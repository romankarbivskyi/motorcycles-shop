import { ProductWithAssets } from "../types/global.ts";
import { NavLink } from "react-router-dom";

interface ProductItemState {
  data: Pick<
    ProductWithAssets,
    "id" | "make" | "model" | "year" | "price" | "stockQuantity" | "images"
  >;
}

export function ProductItem({
  data: { id, make, model, year, price, stockQuantity, images },
}: ProductItemState) {
  const imageUrl =
    images?.length > 0
      ? `http://localhost:5000/static/${images[0].url}`
      : "https://www.digitalocean.com/api/static-content/v1/images?src=%2F_next%2Fstatic%2Fmedia%2Fdefault-avatar.14b0d31d.jpeg&width=64";

  return (
    <NavLink to={`/products/${id}`} className="border p-4 rounded">
      <img
        src={imageUrl}
        alt={`Image of ${make} ${model} (${year})`}
        width={64}
        height={64}
        className="rounded object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "https://via.placeholder.com/64";
        }}
      />
      <div className="mt-2">
        <h3 className="text-lg font-medium">{`${make} ${model} (${year})`}</h3>
        <p className="text-gray-600">Price: ${price}</p>
        <p className="text-sm text-gray-500">
          Stock: {stockQuantity > 0 ? stockQuantity : "Out of stock"}
        </p>
      </div>
    </NavLink>
  );
}