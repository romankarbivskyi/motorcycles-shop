import { SubmitHandler, useForm } from "react-hook-form";
import { ProductWithAssets, Review } from "../global/types.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { createReview, updateReview } from "../api/reviews.ts";

export interface ReviewInput {
  rating: number;
  comment: string;
  userId: number;
  productId: number;
}

export interface ReviewFormProps {
  type: "create" | "update";
  reviewData?: Review;
  productData?: ProductWithAssets;
  cb: () => Promise<any>;
}

export default function ReviewForm({
  type,
  reviewData,
  productData,
  cb,
}: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<ReviewInput>({
    defaultValues: {
      rating: reviewData?.rating || 5,
      comment: reviewData?.comment || "",
      userId: reviewData?.userId || user?.id || undefined,
      productId: reviewData?.productId || productData?.id,
    },
  });

  const selectedRating = watch("rating" as any);

  const onSubmit: SubmitHandler<ReviewInput> = async (data) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    if (type == "create") {
      const { error } = await createReview(data);
      if (error) alert(error);
      await cb();
    } else if (type == "update") {
      const { error } = await updateReview(data, reviewData?.id!);
      if (error) alert(error);
      await cb();
    }
  };

  return (
    <div className="mx-auto p-4 border border-gray-300 rounded">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        {type === "create" ? "Додати відгук" : "Оновити відгук"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Рейтинг:</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((ratingValue) => (
                <label
                  key={ratingValue}
                  className={`flex items-center p-2 text-xl rounded cursor-pointer ${
                    selectedRating >= ratingValue
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={ratingValue}
                    {...register("rating" as any, {
                      required: "Поле обов'язкове",
                      min: { value: 1, message: "Рейтинг повинен бути від 1" },
                      max: {
                        value: 5,
                        message: "Рейтинг не може бути більше 5",
                      },
                    })}
                    className="mr-2 hidden"
                  />
                  ★
                </label>
              ))}
            </div>
            {errors.rating && (
              <span className="text-red-500 text-sm">
                {errors.rating.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="comment" className="text-lg font-semibold">
              Коментарій:
            </label>
            <textarea
              id="comment"
              {...register("comment" as any)}
              className="border rounded p-2"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded mt-4 hover:bg-black/80"
          >
            {type === "create" ? "Додати" : "Зберегти"}
          </button>
        </div>
      </form>
    </div>
  );
}
