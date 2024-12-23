import { useUser } from "../hooks/useUsers.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { RegisterFormInput } from "../components/RegisterForm.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import Modal from "../components/Modal.tsx";
import { updateUser } from "../api/users.ts";

export interface UserProfileInput extends RegisterFormInput {}

export default function ProfilePage() {
  const [modalTitle, setModalTitle] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const { user, isAuthenticated, logout, saveAuthData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAuthenticated) {
      console.log("Navigate");
      navigate("/auth/login");
    }
  }, [user, isAuthenticated, navigate]);

  const { isLoading, isError, data } = useUser(user?.id!);

  useEffect(() => {
    if (data) {
      reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        password: "",
      });
    }
  }, [data]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserProfileInput>({
    defaultValues: {
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      phone: data?.phone || "",
      email: data?.email || "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<UserProfileInput> = async (formData) => {
    try {
      const update = await updateUser(user?.id!, formData);
      saveAuthData(update.data.user, update.data.token);
      console.log("Profile updated successfully");

      setModalTitle("Успіх");
      setModalContent("Профіль оновлено успішно");
      setModalOpen(true);
    } catch (err: any) {
      console.error("Error updating profile", err);

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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div className="p-10 w-[500px] mx-auto">
      <h1 className="text-2xl font-medium mb-3 text-center">Мій профіль</h1>
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
          <label htmlFor="password" className="text-xl">
            Новий пароль:
          </label>
          <input
            type="password"
            id="password"
            className={`border rounded p-2 w-full ${errors.password ? "border-red-500" : ""}`}
            {...register("password" as any, {
              minLength: {
                value: 8,
                message: "Пароль має бути не менше 8 символів",
              },
            })}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-white rounded hover:opacity-75 p-3 "
        >
          Зберегти
        </button>
      </form>
      <button
        className="bg-red-500 text-white p-3 rounded mt-3"
        onClick={() => {
          logout();
        }}
      >
        Вийти
      </button>
      {isModalOpen && (
        <Modal title={modalTitle} onClose={() => setModalOpen(false)}>
          {modalContent}
        </Modal>
      )}
    </div>
  );
}
