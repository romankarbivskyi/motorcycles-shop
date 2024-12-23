import { NavLink, useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.ts";

interface DashboardProps {
  children?: ReactNode;
}

export default function AdminLayout({ children }: DashboardProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, []);

  return (
    <div className="p-10 grid grid-cols-5">
      <div>
        <ul className="col-span-1 flex flex-col gap-2 border border-black p-2 rounded">
          <li>
            <NavLink
              to={"/admin/products/"}
              className="border rounded p-3 block hover:bg-gray-600/10 font-medium text-xl"
            >
              Товари
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/admin/categories/"}
              className="border rounded p-3 block hover:bg-gray-600/10 font-medium text-xl"
            >
              Категорії
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/admin/orders/"}
              className="border rounded p-3 block hover:bg-gray-600/10 font-medium text-xl"
            >
              Замовлення
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/admin/reviews/"}
              className="border rounded p-3 block hover:bg-gray-600/10 font-medium text-xl"
            >
              Відгуки
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/admin/users/"}
              className="border rounded p-3 block hover:bg-gray-600/10 font-medium text-xl"
            >
              Користувачі
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="px-10 col-span-4">{children}</div>
    </div>
  );
}
