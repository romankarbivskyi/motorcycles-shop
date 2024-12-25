import { FetchPaginationParams, ReviewWithUserName } from "../global/types.ts";
import { API } from "../utils/api.ts";
import { handleFetch, HandleFetchResponse } from "../utils/handleFetch.ts";
import { ReviewInput } from "../components/ReviewForm.tsx";

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

export const deleteReview = (
  reviewId: number,
): Promise<HandleFetchResponse<any>> => {
  return handleFetch({
    fetch: async () => await API.delete(`/reviews/${reviewId}`),
  });
};

export const createReview = (reviewData: ReviewInput) => {
  return handleFetch({
    fetch: async () => await API.post("/reviews", reviewData),
  });
};

export const updateReview = (reviewData: ReviewInput, reviewId: number) => {
  return handleFetch({
    fetch: async () => await API.put(`/reviews/${reviewId}`, reviewData),
  });
};
