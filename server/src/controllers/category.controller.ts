import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.categoryId as string);
      const limit = parseInt(req.query.limit as string);
      const offset = parseInt(req.query.offset as string);

      const categories = await CategoryService.getCategories({
        categoryId,
        limit,
        offset,
      });

      if (categoryId) {
        const category = categories[0];
        res.status(200).json(category);
        return;
      }

      res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  }

  static async getCategoryCount(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const count = await CategoryService.getCategoryCount();

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const newCategory = await CategoryService.createCategory(data);

      res.status(200).json(newCategory);
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const categoryId = parseInt(req.params.categoryId);
      const updatedCategory = await CategoryService.updateCategory(
        categoryId,
        data,
      );

      res.status(200).json(updatedCategory);
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      await CategoryService.deleteCategory(categoryId);

      res.status(200).json({
        message: "Category deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
