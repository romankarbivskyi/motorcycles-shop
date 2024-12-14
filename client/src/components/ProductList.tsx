import { useProducts } from "../hooks/useProducts.ts";

export default function ProductList() {
  const { isLoading, data, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  return <div>ok</div>;
}
