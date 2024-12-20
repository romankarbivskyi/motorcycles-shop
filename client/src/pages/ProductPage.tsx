import { useProducts } from "../hooks/useProducts.ts";
import { useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import ProductGallery from "../components/ProductGallery.tsx";
import { useCategories } from "../hooks/useCategories.ts";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();

  const { isLoading, error, product, fetchProductById } = useProducts();
  const { category, fetchCategoryById } = useCategories();

  const loadProduct = useCallback(() => {
    fetchProductById(productId!);
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, []);

  useEffect(() => {
    if (product?.categoryId) {
      fetchCategoryById(product.categoryId);
    }
  }, [product]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div className="p-10">
      <div className="flex align-center justify-between items-start gap-10">
        {product?.images && <ProductGallery images={product.images} />}
        <div className="w-full">
          <h1 className="text-2xl my-3">Oпис товару</h1>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <tbody>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Виробник
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {product?.make || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Модель
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {product?.model || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Рік
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {product?.year || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Ціна
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {product?.price || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Опис
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {product?.description || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Категорія
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {category?.name || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  В наявності
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {product?.stockQuantity || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
          {product?.attributes.length ? (
            <h1 className="text-2xl my-3">Атрибути</h1>
          ) : null}
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <tbody>
              {product?.attributes.map(({ name, value }) => (
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                    {name}
                  </th>
                  <td className="border border-gray-300 px-4 py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
