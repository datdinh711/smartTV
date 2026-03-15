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

  goToBussiness() {
    this._router.navigate([`./${APP_ROUTE.BUSSINESS}`]);
  }

  goToSlideShow() {
    this._router.navigate([`./${APP_ROUTE.SLIDESHOW}`]);
  }
}
