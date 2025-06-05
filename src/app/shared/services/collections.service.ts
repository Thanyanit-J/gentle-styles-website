import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, from, map, of, take, tap } from 'rxjs';

import { Collection } from '$Pages/collections/collections.type';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private readonly collectionsCache = new BehaviorSubject<Collection[]>([]);
  private readonly isFetching = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
  ) {}

  /**
   * Get all collections, fetching from the database if necessary
   */
  getAllCollections(): Observable<Collection[]> {
    if (this.collectionsCache?.value?.length === 0 && !this.isFetching.value) {
      this.fetchCollections();
    }
    return this.collectionsCache.asObservable();
  }

  /**
   * Get the latest collection (with highest number)
   */
  getLatestCollection(): Observable<Collection | null> {
    return this.getAllCollections().pipe(map((collections) => (collections.length > 0 ? collections[0] : null)));
  }

  /**
   * Get a specific number of collections after the latest one
   */
  getOtherCollections(): Observable<Collection[]> {
    return this.getAllCollections().pipe(map((collections) => collections.slice(1, collections.length)));
  }

  /**
   * Get a specific collection by name
   * Returns null if collection doesn't exist
   */
  getCollectionByName(name: string): Observable<Collection | null> {
    return this.getAllCollections().pipe(
      take(1),
      map((collections) => collections.find((c) => c.title === name) ?? null),
    );
  }

  /**
   * Get a specific collection by slug
   * Returns null if collection doesn't exist
   */
  getCollectionBySlug(slug: string): Observable<Collection | null> {
    return this.getAllCollections().pipe(
      take(1),
      map((collections) => collections.find((c) => c.slug === slug) ?? null),
    );
  }

  /**
   * Navigate to collection products or redirect to collections if invalid
   */
  navigateToCollection(collectionSlug: string): Observable<boolean> {
    return this.getCollectionBySlug(collectionSlug).pipe(
      map((collection) => {
        if (collection) {
          return true; // Collection exists, proceed with navigation
        } else {
          this.router.navigate(['/collections']);
          return false; // Collection doesn't exist, redirected
        }
      }),
    );
  }

  /**
   * Force a refresh of the collections data
   */
  refreshCollections(): void {
    this.fetchCollections();
  }

  /**
   * Private method to fetch collections from the database
   */
  private fetchCollections(): void {
    this.isFetching.next(true);

    from(this.supabaseService.getCollections())
      .pipe(
        tap((collections) => {
          if (collections?.length === 0) {
            this.collectionsCache.next([]);
          } else {
            const mappedCollections = collections.map<Collection>(
              (collection) =>
                ({
                  id: collection.id,
                  title: collection.display_name,
                  description: '',
                  full_url: `/collections/${collection.slug}`,
                  number: collection.number,
                  slug: collection.slug,
                }) satisfies Collection,
            );
            this.collectionsCache.next(mappedCollections);
          }
        }),
        catchError(() => {
          return of(null);
        }),
        tap(() => this.isFetching.next(false)),
      )
      .subscribe();
  }
}
