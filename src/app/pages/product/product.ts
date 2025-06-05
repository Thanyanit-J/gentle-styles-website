import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase.service';
import { CollectionsService } from '../../shared/services/collections.service';
import { Product, ProductPlatform } from './product.type';
import { ProductCarousel } from './product-carousel/product-carousel';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCarousel],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class ProductComponent implements OnInit {
  isLoading = signal(true);
  productId = signal<string>('');
  product = signal<Product | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly supabaseService: SupabaseService,
    private readonly collectionsService: CollectionsService,
  ) {}

  ngOnInit() {
    // Get product ID from route params
    this.route.paramMap.subscribe((params) => {
      const sku = params.get('productSKU');
      if (sku) {
        this.productId.set(sku);
        this.loadProduct(sku);
      }
    });
  }

  async loadProduct(sku: string) {
    this.isLoading.set(true);

    try {
      // Get product data from Supabase
      const products = await this.supabaseService.getProducts();
      const product = products.find((p) => p.sku === sku);

      if (!product) {
        console.error('Product not found');
        this.isLoading.set(false);
        return;
      }

      // Get product images
      const images = await this.supabaseService.getProductImagesFromSKU(sku);

      // Transform to our Product interface
      this.product.set({
        id: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku,
        collection_id: product.collection_id,
        images: images
          .map((img) => img.url)
          .sort((a, b) => {
            const aOrder = images.find((i) => i.url === a)?.display_order ?? 0;
            const bOrder = images.find((i) => i.url === b)?.display_order ?? 0;
            return aOrder - bOrder;
          }),

        // TODO: Make this better after we implement the backend
        platforms: [
          {
            name: 'Shopee',
            url: `https://shopee.co.th/gentlestyles_official`,
            logo: 'https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/icon_favicon_1_32.9cd61b2e90c0f104.png',
          },
          {
            name: 'Lazada',
            url: `https://www.lazada.co.th/shop/gentle-styles/`,
            logo: 'https://lzd-img-global.slatic.net/g/tps/tfs/TB1e_.JhHY1gK0jSZTEXXXDQVXa-64-64.png',
          },
        ] satisfies ProductPlatform[],
      });
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    const productData = this.product();
    if (productData?.collection_id) {
      // Get the collection by ID and navigate to its slug URL
      this.collectionsService.getAllCollections().subscribe((collections) => {
        const collection = collections.find((c) => c.id === productData.collection_id);
        if (collection?.slug) {
          this.router.navigate(['/collections', collection.slug]);
        } else {
          // Fallback to collections page if collection not found
          this.router.navigate(['/collections']);
        }
      });
    } else {
      // Fallback to collections page if collection_id is not available
      this.router.navigate(['/collections']);
    }
  }
}
