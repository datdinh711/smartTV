import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigatorService } from '@core/services';

const LANG_KEY = 'app_lang';

@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements OnInit {
  currentLang: 'en' | 'vi' = 'en';

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _translate: TranslateService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem(LANG_KEY) as 'en' | 'vi' | null;
    this.currentLang = saved ?? 'en';
    this._translate.use(this.currentLang);
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
