import { SubmitHandler, useForm } from "react-hook-form";
import { Category } from "../global/types.ts";
import { createCategory, updateCategory } from "../api/categories.ts";
import { useNavigate } from "react-router-dom";

export interface CategoryFormProps {
  type: "create" | "update";
  categoryData?: Category;
}

export interface CategoryInput {
  name: string;
  description: string;
}

export default function CategoryForm({
  type,
  categoryData,
}: CategoryFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    defaultValues: {
      name: categoryData?.name || "",
      description: categoryData?.description || "",
    },
  });

  const onSubmit: SubmitHandler<CategoryInput> = async (data) => {
    try {
      if (type == "create") {
        const res = await createCategory(data);
        if (!res.error) {
          alert("Сатегорію створено успішно");
        } else {
          alert(res.error);
        }
        navigate("/admin/categories");

        return;
      } else {
        const res = await updateCategory(data, categoryData?.id!);
        if (!res.error) {
          alert("Дані збережено");
        } else {
          alert(res.error);
        }
        navigate("/admin/categories");

        return;
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded border">
      <h1 className="text-2xl font-bold mb-4">
        {type === "create" ? "Додати категорію" : "Оновити категорію"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <label htmlFor="make" className="text-xl font-semibold">
            Назва:
          </label>
          <input
            type="text"
            id="make"
            {...register("name" as any, { required: "Поле обов'язкове" })}
            className="border rounded p-2"
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="make" className="text-xl font-semibold">
            Опис:
          </label>
          <input
            type="text"
            id="make"
            {...register("description" as any)}
            className="border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded mt-4"
        >
          {type === "create" ? "Додати" : "Зберегти"}
        </button>
      </form>
    </div>
  );
}
