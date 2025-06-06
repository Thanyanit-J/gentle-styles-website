import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CollectionsService } from '$Shared/services/collections.service';
import { SupabaseService } from '$Shared/services/supabase.service';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  collection: string;
}

@Component({
  selector: 'app-collection-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collection-products.html',
  styleUrl: './collection-products.css',
})
export class CollectionProducts implements OnInit {
  collectionId: string = '';
  collectionName: string = '';
  collectionSlug: string = '';
  products = signal<Product[]>([]);
  collectionNotFound = signal<boolean>(false);
  isLoading = signal<boolean>(true);

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
      this.isLoading.set(true);
      this.collectionNotFound.set(false);

      try {
        // Check if the collection exists using our service
        /**
         * getCollectionBySlug()
         * Get a specific collection by slug
         * Returns null if collection doesn't exist
         */
        this.collectionsService.getCollectionBySlug(this.collectionSlug).subscribe((collection) => {
          if (!collection) {
            // Set collection not found state instead of redirecting
            this.collectionNotFound.set(true);
            this.isLoading.set(false);
            return;
          }

          this.collectionId = collection.id ?? '';
          this.collectionName = collection.title ?? '';
          this.collectionNotFound.set(false);

          this.loadProducts();
        });
      } catch (error) {
        console.error('Error loading collection:', error);
        this.collectionNotFound.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private async loadProducts() {
    try {
      const dbProducts = await this.supabaseService.getProductsWithImageByCollectionId(this.collectionId);

      this.products.set(dbProducts.map((p) => ({
        id: p.id || p.sku,
        sku: p.sku,
        name: p.name,
        price: p.price,
        imageUrl: p.image_url,
        collection: this.collectionName,
      })));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBackToCollections() {
    this.router.navigate(['/collections']);
  }
}
