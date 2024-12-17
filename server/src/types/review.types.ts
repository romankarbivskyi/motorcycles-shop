import { Review } from "./models.types";

export interface CreateReview {
  userId: number;
  productId: number;
  rating: number;
  comment: string;
}

export type UpdateReview = {
  id: number;
  rating: number;
  comment: string;
};
