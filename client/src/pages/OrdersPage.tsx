import { useUserOrders } from "../hooks/useOrders.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import OrderItem from "../components/OrderItem.tsx";

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated]);

  const { isLoading, isError, data } = useUserOrders(user?.id);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  console.log(data);
  return (
    <div className="p-10 flex flex-col gap-3">
      {data?.length ? (
        <>
          <h1 className="text-2xl font-medium mb-3 text-center">
            Мої замовлення
          </h1>
          {data?.map((order) => <OrderItem data={order} />)}
        </>
      ) : (
        <div className="text-center">Ви ще нічого не замовили</div>
      )}
    </div>
  );
}
