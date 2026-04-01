import { Component, OnDestroy, OnInit, Inject } from "@angular/core";
import { DOCUMENT } from '@angular/common';
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
  imports: [NavigationButtonComponent, HomeButtonComponent],
  templateUrl: './key.milestones.component.html',
  styleUrl: './key.milestones.component.scss',
})
export class KeyMilestonesComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _baseHref = '/';

  // ── Navigation source ───────────────────────────────────────────────────────
  // Read from router state in the constructor (the only safe window).
  // Determines what "next" does:
  //   video         →  next goes to StrategyComponent
  //   introduction  →  next goes to IntroductionVideoComponent
  readonly rootNavigateComponent: NavigationSource;

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _inactivityService: InactivityService,
    private readonly _router: Router,
    @Inject(DOCUMENT) private readonly _document: Document,
  ) {
    // getCurrentNavigation() is only valid inside the constructor.
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

  // ── Navigation ──────────────────────────────────────────────────────────────

  nextSlide(): void {
    if (this.rootNavigateComponent === NavigationSource.video) {
      // Came from IntroductionVideo → go to Strategy
      this._navigatorService.goToStrategy();
    } else {
      // Came from Introduction → go to IntroductionVideo, tagging keyMilestones as source
      this._navigatorService.goToIntroductionVideoFrom(NavigationSource.keyMilestones);
    }
  }

  previousSlide(): void {
    this._navigatorService.goToIntroductionVideo();
  }
}
