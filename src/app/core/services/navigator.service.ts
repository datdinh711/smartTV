import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTE } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  constructor(private readonly _router: Router) {}

  goToInfo() {
    this._router.navigate([`/${APP_ROUTE.INFO}`]);
  }

  goToDashboard() {
    this._router.navigate([`/${APP_ROUTE.DASHBOARD}`]);
  }

  goToSlideShow() {
    this._router.navigate([`./${APP_ROUTE.SLIDESHOW}`]);
  }
}
