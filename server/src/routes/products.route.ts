import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { upload } from "../utils/storage";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema, param } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", ProductController.getProducts);
router.get("/count", ProductController.getProductCount);
router.get("/count/category/:categoryId", ProductController.getProductCount);
router.get("/:productId", ProductController.getProducts);
router.get("/category/:categoryId", ProductController.getProducts);
router.get(
  "/search/:searchString",
  param("searchString").notEmpty(),
  validateMiddleware,
  ProductController.getProducts,
);
router.post(
  "/create",
  upload.array("images", 10),
  checkSchema({
    make: {
      isString: {
        errorMessage: "Make must be a string",
      },
      notEmpty: {
        errorMessage: "Make is required",
      },
    },
    model: {
      isString: {
        errorMessage: "Model must be a string",
      },
      notEmpty: {
        errorMessage: "Model is required",
      },
    },
    year: {
      isInt: {
        errorMessage: "Year must be an integer",
      },
      notEmpty: {
        errorMessage: "Year is required",
      },
    },
    price: {
      isInt: {
        options: { min: 0 },
        errorMessage: "Price must be an integer and greater than 0",
      },
      notEmpty: {
        errorMessage: "Price is required",
      },
    },
    description: {
      isString: {
        errorMessage: "Description must be a string",
      },
      notEmpty: {
        errorMessage: "Description is required",
      },
    },
    stockQuantity: {
      isInt: {
        options: { min: 0 },
        errorMessage: "Stock quantity must be an integer and greater than 0",
      },
      notEmpty: {
        errorMessage: "Stock quantity is required",
      },
    },
    categoryId: {
      isInt: {
        errorMessage: "CategoryId must be an integer",
      },
      notEmpty: {
        errorMessage: "Category id is required",
      },
    },
    "attributes.*.name": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Name is required in attributes");
          if (typeof value !== "string")
            throw new Error("Name must be a string");
          return true;
        },
      },
    },
    "attributes.*.value": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Value is required in attributes");
          if (typeof value !== "string")
            throw new Error("Value must be a string");
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
                throw new Error("Each file must be an image");
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
  "/update",
  upload.array("images", 10),
  checkSchema({
    id: {
      in: ["body"],
      isInt: {
        errorMessage: "Id must be an integer",
      },
      notEmpty: {
        errorMessage: "Id is required",
      },
    },
    make: {
      in: ["body"],
      isString: {
        errorMessage: "Make must be a string",
      },
    },
    model: {
      in: ["body"],
      isString: {
        errorMessage: "Model must be a string",
      },
    },
    year: {
      in: ["body"],
      isInt: {
        errorMessage: "Year must be an integer",
      },
    },
    price: {
      in: ["body"],
      isInt: {
        options: { min: 0 },
        errorMessage: "Price must be an integer and greater than 0",
      },
    },
    description: {
      in: ["body"],
      isString: {
        errorMessage: "Description must be a string",
      },
    },
    stockQuantity: {
      in: ["body"],
      isInt: {
        options: { min: 0 },
        errorMessage: "Stock quantity must be an integer and greater than 0",
      },
    },
    categoryId: {
      in: ["body"],
      isInt: {
        errorMessage: "CategoryId must be an integer",
      },
    },
    "attributes.*.name": {
      in: ["body"],
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Name is required in attributes");
          if (typeof value !== "string")
            throw new Error("Name must be a string");
          return true;
        },
      },
    },
    "attributes.*.value": {
      in: ["body"],
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Value is required in attributes");
          if (typeof value !== "string")
            throw new Error("Value must be a string");
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
                throw new Error("File must be an image");
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
  "/delete/:productId",
  authMiddleware(true),
  ProductController.deleteProduct,
);

export default router;
