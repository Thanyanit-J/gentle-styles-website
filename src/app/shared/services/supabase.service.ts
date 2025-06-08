import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabase.url;
    const supabaseAnonKey = environment.supabase.anonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getCollections(): Promise<dbCollection[]> {
    const { data, error } = await this.supabase.from('collections').select('*').order('number', { ascending: false });

    if (error) throw error;
    return data as dbCollection[];
  }

  async getCollectionsWithImage(): Promise<dbCollectionWithImage[]> {
    const { data, error } = await this.supabase
      .from('collections')
      .select('*, collection_images!inner (url)')
      .order('number', { ascending: false });
    if (error) throw error;
    return data.map((item) => ({
      ...item,
      image_url: item.collection_images[0].url,
    })) as dbCollectionWithImage[];
  }

  async getProductBySKU(sku: dbProduct['sku']): Promise<dbProduct | null> {
    const { data, error } = await this.supabase.from('products').select('*').eq('sku', sku);
    if (error) throw error;
    return data[0] as dbProduct;
  }

  async getProductImagesFromSKU(productSKU: dbProduct['sku']): Promise<dbProductImage[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`id, sku, product_images!inner (*)`)
      .eq('sku', productSKU);

    if (error) throw error;
    return data[0].product_images as dbProductImage[];
  }

  /**
   * Get list of products with an image with display order = 0
   * Require collectionId to be provided
   */
  async getProductsWithImageByCollectionId(collectionId: dbProduct['id']): Promise<dbProductWithImage[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(
        `
        *,
        product_images!inner (
          url
        )
      `,
      )
      .eq('collection_id', collectionId)
      .eq('product_images.display_order', 0);

    if (error) throw error;

    return data.map((item) => {
      const { product_images, ...productData } = item;
      return {
        ...productData,
        image_url: product_images[0].url,
      };
    }) as dbProductWithImage[];
  }

  async getPlatforms(): Promise<dbPlatform[]> {
    const { data, error } = await this.supabase.from('platforms').select('id, name');
    if (error) throw error;
    return data as dbPlatform[];
  }

  async getProductListingsByProductId(productId: dbProduct['id']): Promise<dbProductListingWithPlatform[]> {
    const { data, error } = await this.supabase
      .from('product_listings')
      .select(
        `
        id,
        product_id,
        platform_product_id,
        platform_id,
        platforms!inner (
          name
        )
      `,
      )
      .eq('product_id', productId);
    if (error) throw error;

    return data.map((item) => {
      const { platforms, ...productListingData } = item as any;
      return {
        ...productListingData,
        platform_name: platforms.name,
      };
    }) as dbProductListingWithPlatform[];
  }
}

type dbCollection = {
  id: string;
  number: number;
  display_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

type dbCollectionWithImage = dbCollection & {
  image_url: string;
};

type dbProduct = {
  id: string;
  sku: string;
  name: string;
  item_group_id: string;
  collection_id: string;
  price: number;
  created_at: string;
  updated_at: string;
};

type dbProductImage = {
  id: string;
  product_id: string;
  image_name: string;
  url: string;
  display_order: number;
  image_type: string;
  created_at: string;
  updated_at: string;
};

type dbProductWithImage = dbProduct & {
  image_url: string;
};

type dbPlatform = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type dbProductListing = {
  id: string;
  product_id: string;
  platform_product_id: string;
  platform_id: string;
};

type dbProductListingWithPlatform = {
  id: string;
  product_id: string;
  platform_product_id: string;
  platform_id: string;
  platform_name: string;
};
