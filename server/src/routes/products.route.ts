import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { upload } from "../utils/storage";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", ProductController.getProducts);
router.get("/count", ProductController.getProductCount);
router.get("/count/category/:categoryId", ProductController.getProductCount);
router.get("/:productId", ProductController.getProducts);
router.get("/category/:categoryId", ProductController.getProducts);
router.post(
  "/",
  upload.array("images", 10),
  checkSchema({
    make: {
      isString: {
        errorMessage: "Марка повинна бути рядком",
      },
      notEmpty: {
        errorMessage: "Марка є обов'язковою",
      },
    },
    model: {
      isString: {
        errorMessage: "Модель повинна бути рядком",
      },
      notEmpty: {
        errorMessage: "Модель є обов'язковою",
      },
    },
    year: {
      isInt: {
        errorMessage: "Рік повинен бути цілим числом",
      },
      notEmpty: {
        errorMessage: "Рік є обов'язковим",
      },
    },
    price: {
      isInt: {
        options: { min: 0 },
        errorMessage: "Ціна повинна бути цілим числом і більше 0",
      },
      notEmpty: {
        errorMessage: "Ціна є обов'язковою",
      },
    },
    description: {
      isString: {
        errorMessage: "Опис повинен бути рядком",
      },
    },
    stockQuantity: {
      isInt: {
        options: { min: 0 },
        errorMessage:
          "Кількість на складі повинна бути цілим числом і більше 0",
      },
      notEmpty: {
        errorMessage: "Кількість на складі є обов'язковою",
      },
    },
    categoryId: {
      isInt: {
        errorMessage: "ID категорії повинен бути цілим числом",
      },
      notEmpty: {
        errorMessage: "ID категорії є обов'язковим",
      },
    },
    "attributes.*.name": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Ім'я є обов'язковим в атрибутах");
          if (typeof value !== "string")
            throw new Error("Ім'я повинно бути рядком");
          return true;
        },
      },
    },
    "attributes.*.value": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Значення є обов'язковим в атрибутах");
          if (typeof value !== "string")
            throw new Error("Значення повинно бути рядком");
          return true;
        },
      },
    },
    images: {
      custom: {
        options: (value, { req }) => {
          if (req.files && req.files.length > 0) {
            for (const file of req.files) {
              if (!file.mimetype.startsWith("image/")) {
                throw new Error("Кожен файл повинен бути зображенням");
              }
            }
          }
          return true;
        },
      },
    },
  }) as any,
  validateMiddleware,
  authMiddleware(true),
  ProductController.createProduct,
);
router.put(
  "/:productId",
  upload.array("images", 10),
  checkSchema({
    make: {
      in: ["body"],
      isString: {
        errorMessage: "Марка повинна бути рядком",
      },
    },
    model: {
      in: ["body"],
      isString: {
        errorMessage: "Модель повинна бути рядком",
      },
    },
    year: {
      in: ["body"],
      isInt: {
        errorMessage: "Рік повинен бути цілим числом",
      },
    },
    price: {
      in: ["body"],
      isInt: {
        options: { min: 0 },
        errorMessage: "Ціна повинна бути цілим числом і більше 0",
      },
    },
    description: {
      in: ["body"],
      isString: {
        errorMessage: "Опис повинен бути рядком",
      },
    },
    stockQuantity: {
      in: ["body"],
      isInt: {
        options: { min: 0 },
        errorMessage:
          "Кількість на складі повинна бути цілим числом і більше 0",
      },
    },
    categoryId: {
      in: ["body"],
      isInt: {
        errorMessage: "ID категорії повинен бути цілим числом",
      },
    },
    "attributes.*.name": {
      in: ["body"],
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Ім'я є обов'язковим в атрибутах");
          if (typeof value !== "string")
            throw new Error("Ім'я повинно бути рядком");
          return true;
        },
      },
    },
    "attributes.*.value": {
      in: ["body"],
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Значення є обов'язковим в атрибутах");
          if (typeof value !== "string")
            throw new Error("Значення повинно бути рядком");
          return true;
        },
      },
    },
    image: {
      optional: true,
      custom: {
        options: (value, { req }) => {
          if (req.files && req.files.length > 0) {
            for (const file of req.files) {
              if (!file.mimetype.startsWith("image/")) {
                throw new Error("Файл повинен бути зображенням");
              }
            }
          }
          return true;
        },
      },
    },
    deleteImages: {
      optional: true,
      isArray: {
        errorMessage: "deleteImages повинно бути масивом",
      },
      custom: {
        options: (value) => {
          if (Array.isArray(value)) {
            for (const img of value) {
              if (typeof img !== "string") {
                throw new Error(
                  "Кожне зображення в deleteImages повинно бути рядком",
                );
              }
            }
          }
          return true;
        },
      },
    },
    deleteAttributes: {
      optional: true,
      isArray: {
        errorMessage: "deleteAttributes повинно бути масивом",
      },
      custom: {
        options: (value) => {
          if (Array.isArray(value)) {
            for (const name of value) {
              if (typeof name !== "string") {
                throw new Error(
                  "Кожне ім'я в deleteAttributes повинно бути рядком",
                );
              }
            }
          }
          return true;
        },
      },
    },
  }) as any,
  validateMiddleware,
  authMiddleware(true),
  ProductController.updateProduct,
);
router.delete(
  "/:productId",
  authMiddleware(true),
  ProductController.deleteProduct,
);

export default router;
