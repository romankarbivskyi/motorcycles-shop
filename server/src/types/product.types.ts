export interface UpdateProductArgs {
  product: {
    id: number;
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
    attributes?: string[];
  };
  images: string[];
}

export interface GetProductArgs {
  productId?: number;
  search?: string;
  categoryId?: number;
  offset?: number;
  limit?: number;
}
