import { OrderStatus, OrderWithItems } from "../global/types.ts";
import { NavLink } from "react-router-dom";

export interface OrderItemProps {
  data: OrderWithItems;
}

export default function OrderItem({ data }: OrderItemProps) {
  const {
    firstName,
    lastName,
    phone,
    email,
    shipAddress,
    orderItems,
    status,
    totalPrice,
    createAt,
  } = data;

  return (
    <div className="border rounded p-5 relative">
      <div
        className={`p-2 rounded absolute right-5 ${
          status == OrderStatus.Pending
            ? "bg-blue-500"
            : status == OrderStatus.Shipped
              ? "bg-green-500"
              : status == OrderStatus.Cancelled
                ? "bg-orange-500"
                : status == OrderStatus.Completed
                  ? "bg-green-500"
                  : ""
        }`}
      >
        {status}
      </div>
      <h2 className="text-lg font-bold mb-2">Дані отримувача:</h2>
      <ul className="mb-4">
        <li>Ім'я: {firstName}</li>
        <li>Прізвище: {lastName}</li>
        <li>Телефон: {phone}</li>
        <li>Email: {email}</li>
        <li>Адреса доставки: {shipAddress}</li>
        <li>
          Повна ціна:{" "}
          <span className="underline font-medium">${totalPrice}</span>
        </li>
        <li>
          Дата створення:{" "}
          <span className="underline font-medium">
            {new Date(createAt).toLocaleString()}
          </span>
        </li>
      </ul>

      <h2 className="text-lg font-bold mb-2">Продукти:</h2>
      <ul>
        {orderItems.map((item, index) => (
          <li key={index} className="mb-2 border rounded p-2">
            <div>
              Товар:{" "}
              <NavLink
                to={`/products/${item.productId}`}
                className="font-medium underline"
              >
                {item.make} {item.model} {item.year}
              </NavLink>{" "}
              (Product ID: {item.productId})
            </div>
            <div>Кількість: {item.quantity}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
