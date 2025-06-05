import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Collection } from './collections.type';
import { CollectionsService } from '$Shared/services/collections.service';

@Component({
  selector: 'app-collections',
  imports: [RouterModule, TranslateModule],
  templateUrl: './collections.html',
  styleUrl: './collections.css',
})
export class Collections implements OnInit {
  collections = signal<Collection[]>([]);

  constructor(private readonly collectionsService: CollectionsService) {}

  ngOnInit(): void {
    this.collectionsService.getAllCollections().subscribe((collections) => {
      this.collections.set(collections);
    });
  }
}
