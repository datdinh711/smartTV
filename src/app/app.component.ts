import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigatorService, SlideshowService } from '@core/services';
import { TranslateService } from '@ngx-translate/core';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';

const LANG_KEY = 'app_lang';
const DEFAULT_LANG = 'vi';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'smartTV';
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _inactivityService: InactivityService,
    private readonly _slideshowService: SlideshowService,
    private readonly _navigatorService: NavigatorService,
    private readonly _translate: TranslateService,
  ) {
    const saved = localStorage.getItem(LANG_KEY) as 'en' | 'vi' | null;
    const lang = saved ?? DEFAULT_LANG;
    this._translate.use(lang);
  }

  ngOnInit(): void {
    this._inactivityService.start(30000); // 30s không có tương tác

    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        console.log('User is inactive, starting slideshow...');
        this._slideshowService.start();
      });

    this._inactivityService.onActive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        console.log('User is active, stopping slideshow...');
        if (this._slideshowService.isRunning()) {
          this._slideshowService.stop();
          this._navigatorService.goToDashboard();
        }
      });
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._slideshowService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }
}
