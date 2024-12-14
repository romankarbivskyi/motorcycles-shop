export interface Attribute {
  id: number;
  name: string;
  value: string;
}

export interface Image {
  id: number;
  url: string;
}

export interface Product {
  id?: number;
  make?: string;
  model?: string;
  price?: number;
  description?: string;
  stockQuantity?: number;
  images?: Image[];
  attributes?: Attribute[];
}
