import { ReviewWithUserName, User } from "../global/types.ts";
import { deleteReview } from "../api/reviews.ts";

export interface ReviewItemProps {
  data: ReviewWithUserName;
  user?: Omit<User, "password">;
  onDelete: (reviewId: number) => Promise<void>;
  onEdit: (reviewId: number) => Promise<void>;
}

export default function ReviewItem({
  data: { id, rating, comment, firstName, lastName, userId },
  user,
  onEdit,
  onDelete,
}: ReviewItemProps) {
  return (
    <div className="border rounded p-4 mb-4 relative">
      <div className="flex items-center mb-2">
        <span className="font-semibold text-lg">
          {firstName} {lastName}
        </span>
      </div>

      <div className="flex items-center mb-2">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`text-xl ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-gray-700">{comment}</p>

      {user && user.id == userId ? (
        <div className="absolute right-2 top-2 flex gap-2">
          <button onClick={async () => await onEdit(id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              className="fill-black"
            >
              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
            </svg>
          </button>
          <button onClick={async () => await onDelete(id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              className="fill-black"
            >
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
