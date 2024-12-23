import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { createProduct, updateProduct } from "../api/products.ts";
import { useNavigate } from "react-router-dom";
import { Image, ProductWithAssets } from "../global/types.ts";
import { useEffect, useState } from "react";

interface ProductFormProps {
  type: "create" | "update";
  productData?: ProductWithAssets;
}

export interface ProductInput {
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  stockQuantity: number;
  categoryId: number;
  images: File[];
  attributes: { name: string; value: string }[];
  deleteImages?: string[];
  deleteAttributes?: string[];
}

export default function ProductForm({ type, productData }: ProductFormProps) {
  const [loadImages, setLoadImages] = useState<Image[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductInput>({
    defaultValues: {
      make: productData?.make || "",
      model: productData?.model || "",
      year: productData?.year || new Date().getFullYear(),
      price: productData?.price || 0,
      description: productData?.description || "",
      stockQuantity: productData?.stockQuantity || 0,
      categoryId: productData?.categoryId || 0,
      images: [],
      attributes: productData?.attributes || [],
      deleteImages: [],
      deleteAttributes: [],
    } as any,
  });

  useEffect(() => {
    if (productData?.images) setLoadImages(productData.images);
  }, []);

  const attributesFieldArray = useFieldArray({
    control,
    name: "attributes",
  } as any);

  const images = watch("images" as any);

  const onSubmit: SubmitHandler<ProductInput> = async (data) => {
    try {
      if (type === "create") {
        const res = await createProduct(data);
        if (!res.error) {
          console.log(res);
          alert(`Товар створено`);
          navigate("/admin/products/");
        } else {
          alert(res.error);
        }
        return;
      }

      const initialAttributes = productData?.attributes || [];
      const newAttributes = data.attributes || [];

      const deleteAttributes: string[] = [];

      initialAttributes.forEach((attr) => {
        const existsInNew = newAttributes.some(
          (newAttr) => newAttr.name === attr.name,
        );
        if (!existsInNew) {
          deleteAttributes.push(attr.name);
        }
      });

      data.deleteAttributes = deleteAttributes;

      const updatedProduct = await updateProduct(data, productData?.id!);
      alert(`Дані збережено`);
      console.log(updatedProduct);
      navigate("/admin/products/");
    } catch (err: any) {
      alert(`Помилка: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded border">
      <h1 className="text-2xl font-bold mb-4">
        {type === "create" ? "Додати товар" : "Оновити товару"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="make" className="text-xl font-semibold">
            Виробник:
          </label>
          <input
            type="text"
            id="make"
            {...register("make" as any, { required: "Поле обов'язкове" })}
            className="border rounded p-2"
          />
          {errors.make && (
            <span className="text-red-500">{errors.make.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="model" className="text-xl font-semibold">
            Модель:
          </label>
          <input
            type="text"
            id="model"
            {...register("model" as any, { required: "Поле обов'язкове" })}
            className="border rounded p-2"
          />
          {errors.model && (
            <span className="text-red-500">{errors.model.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="year" className="text-xl font-semibold">
            Рік:
          </label>
          <input
            type="number"
            id="year"
            {...register("year" as any, {
              required: "Поле обов'язкове",
              max: {
                value: new Date().getFullYear(),
                message: "Невірний рік",
              },
            })}
            className="border rounded p-2"
          />
          {errors.year && (
            <span className="text-red-500">{errors.year.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="text-xl font-semibold">
            Ціна:
          </label>
          <input
            type="number"
            id="price"
            {...register("price" as any, {
              required: "Поле обов'язкове",
              min: { value: 0, message: "Ціна не може бути від'ємною" },
            })}
            className="border rounded p-2"
          />
          {errors.price && (
            <span className="text-red-500">{errors.price.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-xl font-semibold">
            Опис:
          </label>
          <textarea
            id="description"
            {...register("description" as any, {
              required: "Поле обов'язкове",
              maxLength: {
                value: 500,
                message: "Максимальна кількість символів - 500",
              },
            })}
            className="border rounded p-2"
            rows={3}
          ></textarea>
          {errors.description && (
            <span className="text-red-500">{errors.description.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="images" className="text-xl font-semibold">
            Зоображення:
          </label>
          <input
            id="images"
            type="file"
            multiple={true}
            {...register("images" as any)}
            className="border rounded p-2"
          ></input>
        </div>

        <div className="flex flex-wrap gap-2">
          {images &&
            Array.from(images).map((image, index) => (
              <div key={index} className="relative group">
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() =>
                    setValue(
                      "images" as any,
                      (Array.from(images) as any).filter(
                        (filterFile: File, idx) => idx !== index,
                      ),
                    )
                  }
                >
                  Видалити
                </div>
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 p-1 object-cover rounded-md border"
                />
              </div>
            ))}
          {loadImages &&
            Array.from(loadImages).map((image, index) => (
              <div key={index} className="relative group">
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => {
                    const updatedDeleteImages = [
                      ...(watch("deleteImages" as any) || []),
                    ] as any[];
                    if (!updatedDeleteImages.includes(image.url)) {
                      updatedDeleteImages.push(image.url);
                    }

                    const updatedImages = loadImages.filter(
                      (img: any) => img.url !== image.url,
                    );

                    setLoadImages(updatedImages);

                    setValue("deleteImages" as any, updatedDeleteImages as any);
                  }}
                >
                  Видалити
                </div>
                <img
                  src={`http://localhost:5000/static/${image.url}`}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 p-1 object-cover rounded-md border"
                />
              </div>
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="stockQuantity" className="text-xl font-semibold">
            Кількість:
          </label>
          <input
            type="number"
            id="stockQuantity"
            {...register("stockQuantity" as any, {
              required: "Поле обов'язкове",
              min: { value: 0, message: "Кількість не може бути від'ємною" },
            })}
            className="border rounded p-2"
          />
          {errors.stockQuantity && (
            <span className="text-red-500">{errors.stockQuantity.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="stockQuantity" className="text-xl font-semibold">
            ID Категорії:
          </label>
          <input
            type="number"
            id="stockQuantity"
            {...register("categoryId" as any, {
              required: "Поле обов'язкове",
              min: { value: 0, message: "Кількість не може бути від'ємною" },
            })}
            className="border rounded p-2"
          />
          {errors.stockQuantity && (
            <span className="text-red-500">{errors.stockQuantity.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-xl font-semibold">Атрибути:</label>
          {attributesFieldArray.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <div className="flex flex-col gap-2 w-full">
                <input
                  type="text"
                  placeholder="Назва"
                  {...register(`attributes.${index}.name` as any, {
                    required: "Поле обов'язкове",
                  })}
                  className="border rounded p-2"
                />
                {errors.attributes?.[index]?.name && (
                  <span className="text-red-500">
                    {errors.attributes[index].name?.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <input
                  type="text"
                  placeholder="Значення"
                  {...register(`attributes.${index}.value` as any, {
                    required: "Поле обов'язкове",
                  })}
                  className="border rounded p-2"
                />
                {errors.attributes?.[index]?.value && (
                  <span className="text-red-500">
                    {errors.attributes[index].value?.message}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  attributesFieldArray.remove(index);
                }}
                className="bg-red-500 text-white p-2 rounded"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              attributesFieldArray.append({ name: "", value: "" } as any)
            }
            className="mt-2 bg-blue-500 text-white p-2 rounded"
          >
            Додати атрибут
          </button>
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
