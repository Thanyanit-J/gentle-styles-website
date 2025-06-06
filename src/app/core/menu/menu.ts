import { Component, effect, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MenuService } from '$Shared/services/menu.service';
import { CollectionsService } from '$Shared/services/collections.service';
import { Collection } from '$Pages/collections/collections.type';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  protected readonly menuService = inject(MenuService);
  protected readonly collectionsService = inject(CollectionsService);
  protected readonly visible = signal(false);
  protected readonly collections = signal<Collection[]>([]);

  constructor() {
    this.menuService.menuOpen.subscribe(() => {
      this.open();
    });

    this.menuService.menuClose.subscribe(() => {
      this.close();
    });

    effect(() => {
      document.body.style.overflow = this.visible() ? 'hidden' : '';
    });
  }

  ngOnInit(): void {
    this.collectionsService.getAllCollections().subscribe((collections) => {
      this.collections.set(collections);
    });
  }

  open(): void {
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }
}
