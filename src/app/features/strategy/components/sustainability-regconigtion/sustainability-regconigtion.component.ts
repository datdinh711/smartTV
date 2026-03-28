import { Component, OnInit } from '@angular/core';
import { APP_ROUTES } from '@core/constants/app-route.constant';
import { NavigationHistoryService } from '@core/services';
import { STRATEGY_ROUTES } from '@features/strategy/constants/strategy-route.constant';
import { HomeButtonComponent, NavigationButtonComponent } from '@shared/components';


@Component({
  selector: 'app-farming-pillars',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent],
  templateUrl: './sustainability-regconigtion.component.html',
  styleUrl: './sustainability-regconigtion.component.scss'
})
export class SustainabilityRegconigtionComponent implements OnInit {
  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = APP_ROUTES.STRATEGY;
  nextPath: string =
    `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_VDO}`;

  constructor(
    private readonly _navigationHistoryService: NavigationHistoryService,
  ) {}

  ngOnInit(): void {
    const strategyPath = APP_ROUTES.STRATEGY;
    const vdoPath = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_VDO}`;
    const previousPath = this._navigationHistoryService.getPreviousPath();

    if (previousPath === vdoPath) {
      this.nextPath = APP_ROUTES.DASHBOARD;
      return;
    }

    this.nextPath = vdoPath;
  }
}
