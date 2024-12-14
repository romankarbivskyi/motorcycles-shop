import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getCategories();

      res.status(200).json(categories);
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
      const updatedCategory = await CategoryService.updateCategory(data);

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
