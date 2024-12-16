import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const searchString = req.params.searchString;
      const products = await ProductService.getProducts({
        productId,
        search: searchString,
      });

      if (products.length > 1) {
        res.status(200).json(products);
        return;
      }
      res.status(200).json(products[0]);
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
