export interface Product {
  id: number;
  thumbnail: string;
  images: string[];
  title: string;
  description: string;
  stock: number;
  price: number;
}

export interface ProductState {
  selectedProduct: Product | null;
  favorites: number[];
}

export interface RootState {
  product: ProductState;
}