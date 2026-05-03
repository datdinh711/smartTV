import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, RouteConfigLoadEnd, Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants';
import { NavigatorService } from '@core/services';
import { BUSINESS_PATH } from '@features/business/constants';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationButtonComponent } from '@shared/components';
import { filter } from 'rxjs';
import { GreenFarmingDialogComponent } from './dialogs/green-farming-dialog/green-farming-dialog.component';
import { RenewableEnergyDialogComponent } from './dialogs/renewable-energy-dialog/renewable-energy-dialog.component';
import { WastewaterDialogComponent } from './dialogs/wastewater-dialog/wastewater-dialog.component';

@Component({
  selector: 'app-farming-pillars',
  standalone: true,
  imports: [NgClass, NavigationButtonComponent, CommonModule, RenewableEnergyDialogComponent, WastewaterDialogComponent, GreenFarmingDialogComponent, TranslateModule],
  templateUrl: './farming-pillars.component.html',
  styleUrl: './farming-pillars.component.scss',
})
export class FarmingPillarsComponent implements OnInit {
  menuBar = [
    {
      name: 'Biosecurity & Animal Welfare',
      id: BUSINESS_PATH.BIOSECURITY_ANIMAL_WELFARE,
    },
    {
      name: 'Circular & Green Farming',
      id: BUSINESS_PATH.CIRCULAR,
      subId: BUSINESS_PATH.GREEN_FARMING,
    },
    {
      name: 'Smart Farm Technology',
      id: BUSINESS_PATH.SMART_FARM_TECHNOLOGY,
    },
    {
      name: 'Traceability & Certification',
      id: BUSINESS_PATH.TRACEABILITY,
      subId: BUSINESS_PATH.CERTIFICATION,
    },
  ];
  businessId: string = '';

  BUSINESS_PATH = BUSINESS_PATH;
  APP_ROUTES = APP_ROUTES;

  subDestPath: string = '';

  isRenewableEnergyDialogOpen = false;
  isWastewaterDialogOpen = false;
  isGreenFarmingDialogOpen = false;

  openRenewableEnergyDialog(): void { this.isRenewableEnergyDialogOpen = true; }
  closeRenewableEnergyDialog(): void { this.isRenewableEnergyDialogOpen = false; }

  openWastewaterDialog(): void { this.isWastewaterDialogOpen = true; }
  closeWastewaterDialog(): void { this.isWastewaterDialogOpen = false; }

  openGreenFarmingDialog(): void { this.isGreenFarmingDialogOpen = true; }
  closeGreenFarmingDialog(): void { this.isGreenFarmingDialogOpen = false; }

  constructor(
    private readonly _router: Router,
    private readonly _navigatorService: NavigatorService,
  ) { }

  ngOnInit() {
    // Get url when initial loading
    const initialUrl = this._router.url;
    this.businessId = initialUrl.split('/').pop() ?? '';
    this.subDestPath =
      this.businessId === BUSINESS_PATH.CIRCULAR
        ? `${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.GREEN_FARMING}`
        : `${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.CERTIFICATION}`;

    this._handleNavigationEnd();
  }

  onSelectMenuBar(id: string) {
    this._navigatorService.goToPath(`${APP_ROUTES.BUSINESS}/${id}`);
  }

  onBack() {
    this._navigatorService.goToPath(APP_ROUTES.BUSINESS);
  }

  /**
   * Subscribes to router events and updates businessId and subDestPath when navigation ends or a route config is loaded.
   *
   * @private
   * @memberof FarmingPillarsComponent
   */
  private _handleNavigationEnd() {
    this._router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof RouteConfigLoadEnd,
        ),
      )
      .subscribe((value) => {
        const url = (value as NavigationEnd).url || this._router.url;
        this.businessId = url.split('/').pop() ?? '';
        this.subDestPath =
          this.businessId === BUSINESS_PATH.CIRCULAR
            ? `${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.GREEN_FARMING}`
            : `${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.CERTIFICATION}`;
      });
  }
}
