import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CollectionsService } from '$Shared/services/collections.service';
import { SupabaseService } from '$Shared/services/supabase.service';

interface Product {
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  collection: string;
}

@Component({
  selector: 'app-collection-products',
  imports: [],
  templateUrl: './collection-products.html',
  styleUrl: './collection-products.css',
})
export class CollectionProducts implements OnInit {
  collectionId: string = '';
  collectionName: string = '';
  collectionSlug: string = '';
  products: Product[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly supabaseService: SupabaseService,
    private readonly collectionsService: CollectionsService,
  ) {}

  ngOnInit() {
    // Get the collection slug from the URL parameter
    this.route.params.subscribe(async (params) => {
      this.collectionSlug = params['collectionSlug'];

      try {
        // Check if the collection exists using our service
        /**
         * getCollectionByName()
         * Get a specific collection by name
         * Returns null if collection doesn't exist
         */
        this.collectionsService.getCollectionBySlug(this.collectionSlug).subscribe((collection) => {
          if (!collection) {
            // Redirect to collections page if collection doesn't exist
            this.router.navigate(['/collections']);
            return;
          }

          this.collectionId = collection.id ?? '';
          this.collectionName = collection.title ?? '';

          this.loadProducts();
        });
      } catch (error) {
        console.error('Error loading collection:', error);
        this.router.navigate(['/collections']);
      }
    });
  }

  private async loadProducts() {
    try {
      const dbProducts = await this.supabaseService.getProductsWithImage(this.collectionId);

      this.products = dbProducts.map((p) => ({
        sku: p.sku,
        name: p.name,
        price: p.price,
        imageUrl: p.image_url,
        collection: this.collectionName,
      }));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }
}
