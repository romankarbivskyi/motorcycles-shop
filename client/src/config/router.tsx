import ProductsPage from "../pages/ProductsPage.tsx";
import ProductPage from "../pages/ProductPage.tsx";
import { RouteProps } from "react-router-dom";
import CategoriesPage from "../pages/CategoriesPage.tsx";
import UsersPage from "../pages/UsersPage.tsx";
import OrdersPage from "../pages/OrdersPage.tsx";
import CartPage from "../pages/CartPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";

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
    path: "/products/:productId",
    element: <ProductPage />,
  },
  {
    path: "/products/category/:categoryId",
    element: <ProductsPage />,
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
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
] as RouteProps[];
