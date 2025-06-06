import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Menu } from '$Core/menu/menu';
import { MenuService } from '$Shared/services/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule, Menu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly menuService = inject(MenuService);

  openMenu() {
    this.menuService.openMenu();
  }
}
