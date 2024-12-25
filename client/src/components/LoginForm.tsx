import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { useEffect } from "react";
import { loginUser } from "../api/users.ts";

export interface LoginFormInput {
  email: string;
  password: string;
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { user, isAuthenticated, saveAuthData } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [user, isAuthenticated, navigate]);

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    const res = await loginUser(data);
    if (res.error) {
      alert(res.error);
      return;
    }
    saveAuthData(res.data.user, res.data.token);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
        Увійти
      </button>
    </form>
  );
}
