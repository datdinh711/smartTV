import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants';
import { NavigationSource } from '@core/enums';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  constructor(private readonly _router: Router) { }

  goToWelcome() {
    this._router.navigate([`/${APP_ROUTES.WELCOME}`]);
  }

  goToDashboard() {
    this._router.navigate([`/${APP_ROUTES.DASHBOARD}`]);
  }

  goToIntroduction() {
    this._router.navigate([`./${APP_ROUTES.INTRODUCTION}`]);
  }

  goToStrategy() {
    this._router.navigate([`./${APP_ROUTES.STRATEGY}`]);
  }

  goToSlideShow() {
    this._router.navigate([`./${APP_ROUTES.SLIDESHOW}`]);
  }

  goToPath(path: string) {
    this._router.navigate([`./${path}`]);
  }

  goToIntroductionVideo() {
    this._router.navigate([`/${APP_ROUTES.INTRODUCTION}/video`]);
  }

  goToKeyMilestones() {
    this._router.navigate([`/${APP_ROUTES.INTRODUCTION}/key-milestones`]);
  }

  // ── Source-aware navigation ─────────────────────────────────────────────────
  // Pass the calling component as state so the destination can adjust its
  // own "next" action without query-param pollution in the URL.
  // State must be read via Router.getCurrentNavigation() in the constructor
  // of the destination component — it is unavailable after navigation ends.

  goToIntroductionVideoFrom(source: NavigationSource): void {
    this._router.navigate(
      [`/${APP_ROUTES.INTRODUCTION}/video`],
      { state: { rootNavigateComponent: source } },
    );
  }

  goToKeyMilestonesFrom(source: NavigationSource): void {
    this._router.navigate(
      [`/${APP_ROUTES.INTRODUCTION}/key-milestones`],
      { state: { rootNavigateComponent: source } },
    );
  }
}
