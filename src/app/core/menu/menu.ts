import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MenuService } from '$Shared/services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  protected readonly menuService = inject(MenuService);
  protected readonly visible = signal(false);

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

  open(): void {
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }
}
