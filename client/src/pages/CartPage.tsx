import { ReactNode, useEffect, useState } from "react";
import { Order, OrderItem } from "../global/types.ts";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.tsx";
import { createOrder } from "../api/orders.ts";

export interface OrderInput extends Omit<Order, "id" | "status"> {
  orderItems: Pick<OrderItem, "productId" | "quantity">[];
}

export default function CartPage() {
  const [modalTitle, setModalTitle] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
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
    setValue("orderItems" as any, data);
  }, []);

  const { remove } = useFieldArray({
    control,
    name: "orderItems" as any,
  });

  const onSubmit: SubmitHandler<OrderInput> = async (data) => {
    console.log(data);
    if (!data.orderItems.length) {
      setModalTitle("Помилка");
      setModalContent("Замовлення повинно містити товар");
      setModalOpen(true);
    }

    try {
      const order = await createOrder(data);
      console.log(order);
      navigate("/orders");
      localStorage.removeItem("orderItems");
    } catch (err: any) {
      console.error("Error creating order", err);

      setModalTitle("Помилка");
      setModalOpen(true);

      setModalContent(
        <div>
          <p className="text-red-500">
            {err?.message || "Неочікувана помилка."}
          </p>
        </div>,
      );
    }
  };

  const removeFromCart = (index: number) => {
    const cart = JSON.parse(localStorage.getItem("orderItems") || "[]");

    cart.splice(index, 1);
    remove(index);

    localStorage.setItem("orderItems", JSON.stringify(cart));
  };

  const onModalClose = () => {
    setModalOpen(false);
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
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Телефон має бути 10 цифр",
              },
            })}
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone.message}</span>
          )}
        </div>
        <div className="w-full flex flex-col items-start">
          <label htmlFor="email" className="text-xl">
            E-mail:
          </label>
          <input
            type="email"
            id="email"
            className={`border rounded p-2 w-full ${errors.email ? "border-red-500" : ""}`}
            {...register("email" as any, {
              required: "E-mail обов'язковий",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Невірний формат e-mail",
              },
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
          <h3 className="text-xl mb-2">Продукти</h3>
          {watch("orderItems" as any).map((item: any, index) => {
            return (
              <div key={item.productId} className="w-full flex items-end gap-4">
                <div className="w-full">
                  <label htmlFor={`quantity-${index}`} className="text-xl">
                    Кількість:
                  </label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    className={`border rounded p-2 w-full ${errors.orderItems?.[index]?.quantity ? "border-red-500" : ""}`}
                    {...register(`orderItems.${index}.quantity` as any, {
                      required: "Поле обов'язкове",
                    })}
                  />
                  {errors.orderItems?.[index]?.quantity && (
                    <span className="text-red-500 text-sm">
                      {errors.orderItems[index].quantity.message}
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <label htmlFor={`productId-${index}`} className="text-xl">
                    ID товару:
                  </label>
                  <input
                    type="text"
                    id={`productId-${index}`}
                    className={`border rounded p-2 w-full ${errors.orderItems?.[index]?.productId ? "border-red-500" : ""}`}
                    {...register(`orderItems.${index}.productId` as any, {
                      required: "Поле обов'язкове",
                    })}
                  />
                  {errors.orderItems?.[index]?.productId && (
                    <span className="text-red-500 text-sm">
                      {errors.orderItems[index].productId.message}
                    </span>
                  )}
                </div>
                <button
                  className="bg-black text-white p-3 rounded hover:opacity-75"
                  onClick={() => {
                    removeFromCart(index);
                  }}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="bg-black text-white rounded hover:opacity-75 p-3"
        >
          Створити замовлення
        </button>
      </form>
      {isModalOpen && (
        <Modal title={modalTitle} onClose={() => onModalClose()}>
          {modalContent}
        </Modal>
      )}
    </div>
  );
}
