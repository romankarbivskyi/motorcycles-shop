import { Attribute, Image } from "./models.types";

export interface UpdateProductArgs {
  productId: number;
  product: {
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    description?: string;
    stockQuantity?: number;
    deleteImages?: string;
    categoryId?: number;
    attributes?: string[];
    deleteAttributes?: string[];
  };
  images?: string[];
}

export interface CreateProductArgs {
  product: {
    make: string;
    model: string;
    year: number;
    price: number;
    description: string;
    stockQuantity: number;
    categoryId: number;
    attributes?: any[];
  };
  images: string[];
}

export interface GetProductArgs {
  productId?: number;
  search?: string;
  categoryId?: number;
  offset?: number;
  limit?: number;
  sortByPrice?: "cheap" | "expensive";
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
}

export interface ProductWithAssets {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number | string;
  description: string;
  stockQuantity: number;
  createAt?: Date;
  categoryId: number;
  categoryName: string;
  attributes: Attribute[];
  images: Image[];
}
