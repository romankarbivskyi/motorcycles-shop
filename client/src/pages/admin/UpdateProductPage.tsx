import ProductForm from "../../components/ProductForm.tsx";
import { useParams } from "react-router-dom";
import { useProduct } from "../../hooks/useProducts.ts";

export default function UpdateProductPage() {
  const { productId } = useParams<{
    productId: string;
  }>();

  const { isLoading, isError, data } = useProduct(parseInt(productId!));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div>
      <ProductForm type={"update"} productData={data} />
    </div>
  );
}
