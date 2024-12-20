import { Image, ProductWithAssets } from "../types/global.ts";
import { ProductItem } from "./ProductItem.tsx";

interface ProductListProps {
  data?: ProductWithAssets[];
}

export default function ProductList({ data }: ProductListProps) {
  return (
    <div className="grid grid-cols-5 gap-5 w-full p-10">
      {data?.map((data) => <ProductItem data={data} />)}
    </div>
  );
}
