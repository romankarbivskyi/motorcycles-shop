import LoginForm from "../components/LoginForm.tsx";
import RegisterForm from "../components/RegisterForm.tsx";
import { NavLink } from "react-router-dom";

export interface AuthPageProps {
  type: "login" | "register";
}

export default function AuthPage({ type }: AuthPageProps) {
  return (
    <div className="p-10 text-center">
      <div className="w-[500px] mx-auto">
        <h1 className="text-2xl font-medium mb-5">
          {type == "login" ? "Вхід" : "Реєстрація"}
        </h1>
        {type == "login" ? <LoginForm /> : <RegisterForm />}
      </div>
      <p className="mt-5">
        Або{" "}
        {type == "login" ? (
          <NavLink to={"/auth/register"} className="underline">
            Реєстрація
          </NavLink>
        ) : (
          <NavLink to={"/auth/login"} className="underline">
            Вхід
          </NavLink>
        )}
      </p>
    </div>
  );
}
