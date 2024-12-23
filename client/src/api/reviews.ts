import { FetchPaginationParams, ReviewWithUserName } from "../global/types.ts";
import { API } from "../utils/api.ts";

export interface FetchReviewsParams extends FetchPaginationParams {}

export const fetchReviews = async (
  params?: FetchReviewsParams,
  productId?: number,
): Promise<{
  reviews: ReviewWithUserName[];
  count: number;
}> => {
  const { data: reviewsData } = await API.get<ReviewWithUserName[]>(
    `/reviews${productId ? `/product/${productId}` : ""}`,
    {
      params,
    } as any,
  );

  const { data: countData } = await API.get<number>(
    `/reviews/count${productId ? `/product/${productId}` : ""}`,
    {
      params,
    } as any,
  );

  return { reviews: reviewsData, count: countData } as {
    reviews: ReviewWithUserName[];
    count: number;
  };
};
