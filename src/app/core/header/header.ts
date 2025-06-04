import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
