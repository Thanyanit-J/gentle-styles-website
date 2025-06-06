import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CollectionsService } from '$Shared/services/collections.service';
import { Collection } from '$Pages/collections/collections.type';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [RouterModule, RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  latestCollection = signal<Collection | null>(null);
  otherCollections = signal<Collection[]>([]);
  protected readonly maxOtherCollections = 4;

  constructor(private readonly collectionsService: CollectionsService) {}

  ngOnInit(): void {
    // Get the latest collection for the hero section
    this.collectionsService
      .getLatestCollection()
      .pipe(
        finalize(() => {
          // This will run after observable completes or errors
          // No action needed here as the template handles null values
        }),
      )
      .subscribe({
        next: (collection) => {
          this.latestCollection.set(collection);
        },
        error: (error) => {
          console.error('Error fetching latest collection:', error);
          // Keep latestCollection as null, which will trigger the skeleton UI
        },
      });

    // Get up to 4 other collections for the grid (latest to oldest)
    this.collectionsService
      .getOtherCollections()
      .pipe(
        finalize(() => {
          // This will run after observable completes or errors
          // No action needed here as the template handles empty arrays
        }),
      )
      .subscribe({
        next: (collections) => {
          this.otherCollections.set(collections);
        },
        error: (error) => {
          console.error('Error fetching other collections:', error);
          // Keep otherCollections as empty array, which will trigger the skeleton UI
        },
      });
  }
}
