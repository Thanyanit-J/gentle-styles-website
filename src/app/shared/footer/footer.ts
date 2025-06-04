import { Component, inject } from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly translate = inject(TranslateService);

  onLanguageToggle(event: Event) {
    event.preventDefault();
    this.translate.use(this.translate.currentLang === 'en' ? 'th' : 'en');
  }
}
