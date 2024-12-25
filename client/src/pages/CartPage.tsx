import { ReactNode, useEffect, useState } from "react";
import { Order, OrderItem, ProductWithAssets } from "../global/types.ts";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.ts";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "../components/Modal.tsx";
import { createOrder } from "../api/orders.ts";
import { fetchProductByID } from "../api/products.ts";

export interface OrderInput extends Omit<Order, "id" | "status"> {
  orderItems: Pick<OrderItem, "productId" | "quantity">[];
}

export interface ProductDetails {
  make: string;
  model: string;
  year: string;
  stockQuantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [productDetails, setProductDetails] = useState<
    Record<string, ProductDetails>
  >({});

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("orderItems") || "[]");
    setCartItems(data);
    const productIds = data.map((item: any) => item.productId);
    fetchProductDetails(productIds);
  }, []);

  const fetchProductDetails = async (productIds: string[]) => {
    const details = await Promise.all(
      productIds.map(async (productId) => {
        const data = await fetchProductByID(parseInt(productId));
        return data as ProductWithAssets;
      }),
    );

    const detailsMap: Record<string, ProductDetails> = {};
    details.forEach((detail) => {
      detailsMap[detail.id] = detail as ProductDetails;
    });
    setProductDetails(detailsMap);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrderInput>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      userId: user?.id,
      shipAddress: "",
      orderItems: [],
    },
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("orderItems") || "[]");
    const filteredData = data.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    setValue("orderItems" as any, filteredData);
  }, []);

  const onSubmit: SubmitHandler<OrderInput> = async (data) => {
    if (!data.orderItems.length) alert("Замовлення повинно містити товар");

    const { error } = await createOrder(data);
    console.log(error);
    if (error) alert(error);
    else {
      navigate("/orders");
      localStorage.removeItem("orderItems");
    }
  };

  const removeFromCart = (index: number) => {
    const cart = [...cartItems];
    cart.splice(index, 1);
    setCartItems(cart);
    localStorage.setItem("orderItems", JSON.stringify(cart));
  };

  return (
    <div className="p-10 w-[500px] mx-auto">
      <h1 className="text-2xl font-medium mb-3 text-center">Нове замовлення</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex justify-between gap-5">
          <div className="w-full flex flex-col items-start">
            <label htmlFor="firstName" className="text-xl">
              Ім'я:
            </label>
            <input
              type="text"
              id="firstName"
              className={`border rounded p-2 w-full ${errors.firstName ? "border-red-500" : ""}`}
              {...register("firstName" as any, {
                required: "Ім'я обов'язкове",
              })}
            />
            {errors.firstName && (
              <span className="text-red-500 text-sm">
                {errors.firstName.message}
              </span>
            )}
          </div>
          <div className="w-full flex flex-col items-start">
            <label htmlFor="lastName" className="text-xl">
              Прізвище:
            </label>
            <input
              type="text"
              id="lastName"
              className={`border rounded p-2 w-full ${errors.lastName ? "border-red-500" : ""}`}
              {...register("lastName" as any, {
                required: "Прізвище обов'язкове",
              })}
            />
            {errors.lastName && (
              <span className="text-red-500 text-sm">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col items-start">
          <label htmlFor="phone" className="text-xl">
            Телефон:
          </label>
          <input
            type="text"
            id="phone"
            className={`border rounded p-2 w-full ${errors.phone ? "border-red-500" : ""}`}
            {...register("phone" as any, {
              required: "Телефон обов'язковий",
            })}
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone.message}</span>
          )}
        </div>
        <div className="w-full flex flex-col items-start">
          <label htmlFor="email" className="text-xl">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className={`border rounded p-2 w-full ${errors.email ? "border-red-500" : ""}`}
            {...register("email" as any, {
              required: "Email обов'язковий",
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="w-full flex flex-col items-start">
          <label htmlFor="shipAddress" className="text-xl">
            Адреса доставки:
          </label>
          <input
            type="text"
            id="shipAddress"
            className={`border rounded p-2 w-full ${errors.shipAddress ? "border-red-500" : ""}`}
            {...register("shipAddress" as any, {
              required: "Поле обов'язкове",
            })}
          />
          {errors.shipAddress && (
            <span className="text-red-500 text-sm">
              {errors.shipAddress.message}
            </span>
          )}
        </div>
        <div className="border rounded p-2">
          <h2 className="text-xl mb-3">Товари в кошику:</h2>
          {cartItems.map((item, index) => {
            const product = productDetails[item.productId];
            return (
              <div
                key={index}
                className="flex justify-between items-center border rounded p-2"
              >
                <div>
                  <NavLink
                    to={`/products/${item.productId}`}
                    className="underline font-medium"
                  >
                    <p className="text-lg">
                      {product
                        ? `${product.make} ${product.model} (${product.year})`
                        : "Loading..."}
                    </p>
                  </NavLink>
                  <label htmlFor={`quantity-${index}`} className="text-xl">
                    Кількість:{" "}
                  </label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    className="border p-2 rounded"
                    value={item.quantity}
                    max={product?.stockQuantity || 0}
                    onChange={(e) => {
                      const newQuantity = Number(e.target.value);
                      const updatedCartItems = [...cartItems];
                      updatedCartItems[index].quantity = newQuantity;
                      setCartItems(updatedCartItems);
                      localStorage.setItem(
                        "orderItems",
                        JSON.stringify(updatedCartItems),
                      );
                      setValue(
                        `orderItems.${index}.quantity` as any,
                        newQuantity as any,
                      );
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(index)}
                  className="text-red-500"
                >
                  Видалити
                </button>
              </div>
            );
          })}
        </div>
        <button type="submit" className=" p-2 bg-black text-white rounded">
          Оформити замовлення
        </button>
      </form>
    </div>
  );
}
