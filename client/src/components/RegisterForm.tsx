import { SubmitHandler, useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.ts";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/users.ts";

export interface RegisterFormInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { user, isAuthenticated, saveAuthData } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [user, isAuthenticated, navigate]);

  const onSubmit: SubmitHandler<RegisterFormInput> = async (data) => {
    const res = await registerUser(data);
    if (res.error) {
      alert(res.error);
      return;
    }
    saveAuthData(res.data.user, res.data.token);
  };

  return (
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
            {...register("firstName" as any, { required: "Ім'я обов'язкове" })}
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
          Пароль:
        </label>
        <input
          type="password"
          id="password"
          className={`border rounded p-2 w-full ${errors.password ? "border-red-500" : ""}`}
          {...register("password" as any, {
            required: "Пароль обов'язковий",
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
        className="bg-black text-white rounded hover:opacity-75 p-3"
      >
        Зареєструватись
      </button>
    </form>
  );
}
