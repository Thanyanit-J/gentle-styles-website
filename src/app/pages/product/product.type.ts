export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  platforms?: ProductPlatform[];
  sku: string;
  collection_id?: string;
}

export type ProductPlatform = {
  name: string;
  url: string;
  logo: string;
}