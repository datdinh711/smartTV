import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTE } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  constructor(private readonly _router: Router) {}

  goToWelcome() {
    this._router.navigate([`/${APP_ROUTE.WELCOME}`]);
  }

  goToDashboard() {
    this._router.navigate([`/${APP_ROUTE.DASHBOARD}`]);
  }

  goToIntroduction() {
    this._router.navigate([`./${APP_ROUTE.INTRODUCTION}`]);
  }

  goToStrategy() {
    this._router.navigate([`./${APP_ROUTE.STRATEGY}`]);
  }

  goToBusiness() {
    this._router.navigate([`./${APP_ROUTE.BUSINESS}`]);
  }

  goToSlideShow() {
    this._router.navigate([`./${APP_ROUTE.SLIDESHOW}`]);
  }

  goToPath(path: string) {
    this._router.navigate([`./${path}`]);
  }
}
