import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";

export default function Header() {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <header className="border-b">
      <div className="container-md mx-auto flex items-center justify-between p-7">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30"
            viewBox="0 -960 960 960"
            width="30"
            className="fill-black"
          >
            <path d="M480-480Zm80 240q100 0 170-70t70-170q0-101-73.5-170.5T550-720q-48 0-93 11t-87 33l100 40q41 17 65.5 52.5T560-504q0 60-41.5 102T418-360H162q-2 24-2 54.5v65.5h400ZM176-440h240q27 0 45.5-18.5T480-504q0-19-10.5-34.5T440-562l-148-60q-42 37-71.5 84T176-440Zm384 280H160q-33 0-56.5-23.5T80-240v-90q0-98 37-183.5t100.5-149Q281-726 367-763t183-37q68 0 128 25t105 68.5Q828-663 854-605t26 125q0 66-25 124.5t-68.5 102Q743-210 684.5-185T560-160Z" />
          </svg>
          <span className="text-xl font-semibold">Мотоцикли</span>
        </div>
        <nav className="flex items-center gap-10">
          <ul className="flex gap-3">
            <li>
              <NavLink to="/products">
                {({ isActive }) => (
                  <span
                    className={`py-5 ${isActive ? "before:content-['•'] before:mr-2" : ""}`}
                  >
                    Товари
                  </span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/categories">
                {({ isActive }) => (
                  <span
                    className={`py-5 ${isActive ? "before:content-['•'] before:mr-2" : ""}`}
                  >
                    Категорії
                  </span>
                )}
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to="/orders">
                  {({ isActive }) => (
                    <span
                      className={`py-5 ${isActive ? "before:content-['•'] before:mr-2" : ""}`}
                    >
                      Замовлення
                    </span>
                  )}
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li>
                <NavLink to="/admin" className="text-nowrap">
                  {({ isActive }) => (
                    <span
                      className={`py-5 ${isActive ? "before:content-['•'] before:mr-2" : ""}`}
                    >
                      Адмін панель
                    </span>
                  )}
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="flex items-center gap-2">
            <li>
              <NavLink to="/cart">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  className="fill-black"
                >
                  <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" />
                </svg>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  className="fill-black"
                >
                  <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
                </svg>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
