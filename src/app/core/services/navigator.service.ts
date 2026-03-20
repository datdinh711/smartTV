import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  constructor(private readonly _router: Router) {}

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

  goToBusiness() {
    this._router.navigate([`./${APP_ROUTES.BUSINESS}`]);
  }

  goToSlideShow() {
    this._router.navigate([`./${APP_ROUTES.SLIDESHOW}`]);
  }

  goToPath(path: string) {
    this._router.navigate([`./${path}`]);
  }
}
