import { useProduct } from "../hooks/useProducts.ts";
import { useParams } from "react-router-dom";
import ProductGallery from "../components/ProductGallery.tsx";
import { useState } from "react";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState<number>(1);

  const { isError, isLoading, data } = useProduct(
    parseInt(productId as string),
  );

  const addToCart = async () => {
    const cart = JSON.parse(localStorage.getItem("orderItems") || "[]");

    const existingProductIndex = cart.findIndex(
      (item) => item.productId === parseInt(productId as string),
    );

    if (existingProductIndex > -1) {
      cart[existingProductIndex].quantity = quantity;
    } else {
      cart.push({ productId: parseInt(productId as string), quantity });
    }

    localStorage.setItem("orderItems", JSON.stringify(cart));
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  console.log(data);

  return (
    <div className="p-10">
      <div className="flex align-center justify-between items-start gap-10">
        {data?.images && <ProductGallery images={data.images} />}
        <div className="w-full flex-1">
          <h1 className="text-2xl my-3">Oпис товару</h1>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <tbody>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Виробник
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.make || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Модель
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.model || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Рік
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.year || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Ціна
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.price || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Опис
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.description || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  Категорія
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.categoryName || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
                  В наявності
                </th>
                <td className="border border-gray-300 px-4 py-2">
                  {data?.stockQuantity || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-col my-3 items-start w-full gap-2">
            <label
              htmlFor="quantity"
              className="text-black font-medium text-xl"
            >
              Кількість:
            </label>
            <div className="flex w-full gap-3">
              <input
                id="quantity"
                type="number"
                value={quantity}
                min={1}
                max={data?.stockQuantity}
                className="border rounded p-2 "
                onInput={(e) =>
                  setQuantity(
                    parseInt(e.target.value) > data?.stockQuantity
                      ? (data?.stockQuantity as number)
                      : parseInt(e.target.value),
                  )
                }
              />
              <button
                className="bg-black text-white rounded hover:opacity-75 p-2"
                onClick={addToCart}
              >
                Купити
              </button>
            </div>
          </div>
          {data?.attributes?.length ? (
            <h1 className="text-2xl my-3">Атрибути</h1>
          ) : null}
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <tbody>
              {data?.attributes?.map(({ name, value }) => (
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
