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

  async getProducts(collectionId?: dbCollection['id']): Promise<dbProduct[]> {
    let query = this.supabase.from('products').select('*');

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as dbProduct[];
  }

  async getProductImages(productId: dbProduct['id']): Promise<dbProductImage[]> {
    const { data, error } = await this.supabase.from('product_images').select('*').eq('product_id', productId);

    if (error) throw error;
    return data as dbProductImage[];
  }

  /**
   * Get list of products with an image with display order = 0
   * Require collectionId to be provided
   */
  async getProductsWithImage(collection: dbProduct['id']): Promise<dbProductWithImage[]> {
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
      .eq('collection_id', collection)
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
}

type dbCollection = {
  id: string;
  number: number;
  display_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
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
