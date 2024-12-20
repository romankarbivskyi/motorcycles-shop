import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const searchString = req.params.searchString;
      const categoryId = parseInt(req.params.categoryId);

      const limit: number | undefined = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const offset: number | undefined = req.query.offset
        ? parseInt(req.query.offset as string)
        : undefined;

      const products = await ProductService.getProducts({
        productId,
        search: searchString,
        categoryId,
        limit,
        offset,
      });

      if (productId) {
        res.status(200).json(products[0]);
        return;
      }
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }

  static async getProductCount(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const count = await ProductService.getProductCount(categoryId);

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const images = (req.files as Express.Multer.File[]).map(
        (file) => file.filename,
      );
      const data = req.body;
      console.log(data);
      const product = await ProductService.createProduct({
        product: data,
        images: images || [],
      });

      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const images = (req.files as Express.Multer.File[]).map(
        (file) => file.filename,
      );
      const data = req.body;
      console.log(data);
      const product = await ProductService.updateProduct({
        product: data,
        images: images || [],
      });

      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      await ProductService.deleteProduct(productId);

      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
