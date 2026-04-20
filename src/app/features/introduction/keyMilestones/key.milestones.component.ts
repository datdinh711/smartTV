import { Component, OnDestroy, OnInit, Inject, HostListener } from "@angular/core";
import { DOCUMENT, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NavigatorService } from '@core/services';
import { NavigationSource } from '@core/enums';
import { InactivityService } from '@shared/services';
import { Subject, takeUntil } from 'rxjs';
import { NavigationButtonComponent } from '@shared/components/navigation-button/navigation-button.component';
import { HomeButtonComponent } from '@shared/components/home-button/home-button.component';

@Component({
  selector: 'app-strategy',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent, TranslateModule, NgIf],
  templateUrl: './key.milestones.component.html',
  styleUrl: './key.milestones.component.scss',
})
export class KeyMilestonesComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _baseHref = '/';

  // Used as [attr.d] on the SVG path element.
  // The CSS milestone positions (left/top %) are derived from the same
  // 1920×1080 viewBox coordinates, so they stay aligned as the SVG scales.
  readonly tlPath =
    'M 0,680 C 200,680 360,380 560,380 ' +
    'C 760,380 930,680 1120,680 ' +
    'C 1310,680 1480,380 1680,380 ' +
    'C 1800,380 1880,470 1920,470';

  readonly rootNavigateComponent: NavigationSource;

  readonly msYears: Record<number, string> = {
    1: '1993',
    2: '1994 – 2000',
    3: '2001',
    4: '2006',
    5: '2014',
    6: '2020',
  };

  activeMs: number | null = null;

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
    private readonly _router: Router,
    @Inject(DOCUMENT) private readonly _document: Document,
  ) {
    const navState = this._router.getCurrentNavigation()?.extras?.state;
    this.rootNavigateComponent =
      (navState?.['rootNavigateComponent'] as NavigationSource) ??
      NavigationSource.video;

    const baseEl = this._document.getElementsByTagName('base')[0];
    const href = baseEl ? baseEl.getAttribute('href') : null;
    this._baseHref = href ?? '/';
    if (!this._baseHref.endsWith('/')) {
      this._baseHref += '/';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMs();
  }

  openMs(index: number): void {
    this.activeMs = index;
  }

  closeMs(): void {
    this.activeMs = null;
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

  nextSlide(): void {
    if (this.rootNavigateComponent === NavigationSource.video) {
      this._navigatorService.goToStrategy();
    } else {
      this._navigatorService.goToIntroductionVideoFrom(NavigationSource.keyMilestones);
    }
  }

  previousSlide(): void {
    this._navigatorService.goToIntroductionVideo();
  }
}
