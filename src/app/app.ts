import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Footer } from '$Core/footer/footer';
import { Header } from '$Core/header/header';
import { Menu } from '$Core/menu/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, Menu],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
