import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  from,
  map,
  of,
  shareReplay,
  take,
  tap,
  switchMap,
  takeUntil,
} from 'rxjs';

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
      return this.fetchCollections();
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

  private fetchCollectionsObservable: Observable<Collection[]> | null = null;
  private readonly refreshTrigger = new Subject<void>();

  /**
   * Private method to fetch collections from the database
   * Returns an observable that emits when fetch completes
   */
  private fetchCollections(): Observable<Collection[]> {
    this.refreshTrigger.next();
    this.fetchCollectionsObservable = null;

    this.isFetching.next(true);

    // Create a new observable that will complete when the HTTP request completes
    this.fetchCollectionsObservable = from(this.supabaseService.getCollections()).pipe(
      map((collections) => {
        if (collections?.length === 0) {
          return [];
        } else {
          return collections.map<Collection>(
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
        }
      }),
      catchError(() => of([])),
      tap((collections) => {
        this.collectionsCache.next(collections);
        this.isFetching.next(false);
      }),
      takeUntil(this.refreshTrigger),
      // Use shareReplay with refCount: true to ensure the observable is disposed when there are no more subscribers
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    return this.fetchCollectionsObservable;
  }
}
