import { Component } from '@angular/core';
import { NavigatorService } from '@core/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const LANG_KEY = 'app_lang';

@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  currentLang: 'en' | 'vi';

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _translate: TranslateService
  ) {
    this.currentLang = (this._translate.getCurrentLang() ?? 'vi') as 'en' | 'vi';
  }

  switchLanguage(lang: 'en' | 'vi'): void {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    this._translate.use(lang);
    localStorage.setItem(LANG_KEY, lang);
  }

  onNavigateDashboard(): void {
    this._navigatorService.goToDashboard();
  }
}
