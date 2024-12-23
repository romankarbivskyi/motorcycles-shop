import { Image, ProductWithAssets } from "../global/types.ts";
import { ProductCard } from "./ProductCard.tsx";

interface ProductListProps {
  data?: ProductWithAssets[];
}

export default function ProductList({ data }: ProductListProps) {
  return (
    <div className="grid grid-cols-5 gap-5 w-full my-5">
      {data?.map((data, i) => <ProductCard data={data} key={i} />)}
    </div>
  );
}
