import ProductsPage from "../pages/ProductsPage.tsx";
import ProductPage from "../pages/ProductPage.tsx";
import { RouteProps } from "react-router-dom";
import CategoriesPage from "../pages/CategoriesPage.tsx";
import OrdersPage from "../pages/OrdersPage.tsx";
import CartPage from "../pages/CartPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import AuthPage from "../pages/AuthPage.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import ManageProductsPage from "../pages/admin/ManageProductsPage.tsx";
import ManageCategoriesPage from "../pages/admin/ManageCategoriesPage.tsx";
import ManageOrdersPage from "../pages/admin/ManageOrdersPage.tsx";
import ManageReviewsPage from "../pages/admin/ManageReviewsPage.tsx";
import ManageUsersPage from "../pages/admin/ManageUsersPage.tsx";
import CreateProductPage from "../pages/admin/CreateProductPage.tsx";
import UpdateProductPage from "../pages/admin/UpdateProductPage.tsx";
import UpdateCategoriesPage from "../pages/admin/UpdateCategoriesPage.tsx";
import CreateCategoriesPage from "../pages/admin/CreateCategoriesPage.tsx";

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
    path: "/products/search/:searchString",
    element: <ProductsPage />,
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
  {
    path: "/auth/login",
    element: <AuthPage type={"login"} />,
  },
  {
    path: "/auth/register",
    element: <AuthPage type={"register"} />,
  },
  {
    path: "/admin/",
    element: (
      <AdminLayout>
        <ManageProductsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <AdminLayout>
        <ManageProductsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/categories",
    element: (
      <AdminLayout>
        <ManageCategoriesPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <AdminLayout>
        <ManageOrdersPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/reviews",
    element: (
      <AdminLayout>
        <ManageReviewsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminLayout>
        <ManageUsersPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/products/create",
    element: (
      <AdminLayout>
        <CreateProductPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/products/update/:productId",
    element: (
      <AdminLayout>
        <UpdateProductPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/categories/create",
    element: (
      <AdminLayout>
        <CreateCategoriesPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/categories/update/:categoryId",
    element: (
      <AdminLayout>
        <UpdateCategoriesPage />
      </AdminLayout>
    ),
  },
] as RouteProps[];
