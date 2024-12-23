import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { GetProductArgs } from "../types/product.types";
import { undefined } from "zod";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const categoryId = parseInt(req.params.categoryId);
      const priceMin = parseInt(req.query.priceMin as string) || 0;
      const priceMax = parseInt(req.query.priceMax as string) || Infinity;
      const yearMin = parseInt(req.query.yearMin as string) || 2000;
      const yearMax =
        parseInt(req.query.yearMax as string) || new Date().getFullYear();
      const search = req.query.search
        ? (req.query.search as string).toLowerCase()
        : "";

      const limit = parseInt(req.query.limit as string);
      const offset = parseInt(req.query.offset as string);

      const sortByPrice: GetProductArgs["sortByPrice"] = req.query
        .sortByPrice as GetProductArgs["sortByPrice"] | undefined;

      const products = await ProductService.getProducts({
        productId,
        search,
        categoryId,
        limit,
        offset,
        sortByPrice,
        priceMin,
        priceMax,
        yearMin,
        yearMax,
      });

      if (productId) {
        const product = products[0];
        res.status(200).json(product);
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
      const search = req.query.search
        ? (req.query.search as string).toLowerCase()
        : "";

      const count = await ProductService.getProductCount(categoryId, search);

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
      const productId = parseInt(req.params.productId);
      console.log(data);
      const product = await ProductService.updateProduct({
        productId,
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
