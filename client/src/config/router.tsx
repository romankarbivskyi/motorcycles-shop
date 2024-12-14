import ProductsPage from "../pages/ProductsPage.tsx";
import ProductPage from "../pages/ProductsPage.tsx";
import { RouteProps } from "react-router-dom";
import CategoriesPage from "../pages/CategoriesPage.tsx";
import UsersPage from "../pages/UsersPage.tsx";
import OrdersPage from "../pages/OrdersPage.tsx";

export default [
  {
    path: "/",
    element: <ProductsPage />,
  },
  {
    path: "/products",
    element: <ProductsPage />,
  },
  {
    path: "/products/:id",
    element: <ProductPage />,
  },
  {
    path: "/categories",
    element: <CategoriesPage />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/orders",
    element: <OrdersPage />,
  },
] as RouteProps[];
