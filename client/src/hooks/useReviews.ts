import { useQuery } from "@tanstack/react-query";
import { FetchUsersParams } from "../api/users.ts";
import { fetchReviews } from "../api/reviews.ts";

export interface UseReviewsProps {
  params?: FetchUsersParams;
  productId?: number;
}

export const useReviews = ({ params, productId }: UseReviewsProps) => {
  return useQuery({
    queryKey: ["reviews", params, productId],
    queryFn: async () => await fetchReviews(params, productId),
  });
};
