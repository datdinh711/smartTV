import { Component, OnDestroy, OnInit, Inject } from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { NavigatorService } from '@core/services';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { NavigationButtonComponent } from '@shared/components/navigation-button/navigation-button.component';
import { HomeButtonComponent } from '@shared/components/home-button/home-button.component';

@Component({
  selector: 'app-strategy',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent],
  templateUrl: './key.milestones.component.html',
  styleUrl: './key.milestones.component.scss',
})
export class KeyMilestonesComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _baseHref = '/';

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
    @Inject(DOCUMENT) private readonly _document: Document,
  ) {
    const baseEl = this._document.getElementsByTagName('base')[0];
    const href = baseEl ? baseEl.getAttribute('href') : null;
    this._baseHref = href ?? '/';
    if (!this._baseHref.endsWith('/')) {
      this._baseHref += '/';
    }
  }

  ngOnInit(): void {
    this._inactivityService.start();
    this._inactivityService.onInactive$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {});
  }

  ngOnDestroy(): void {
    this._inactivityService.stop();
    this._destroy$.next();
    this._destroy$.complete();
  }

  asset(path: string): string {
    return `${this._baseHref}assets/${path}`.replace(/([^:]?)\/\/+/, '$1/');
  }
}
