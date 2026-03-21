import { Component, OnInit } from '@angular/core';
import { APP_ROUTE } from '@core/constants/app-route.constant';
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
  APP_ROUTE = APP_ROUTE;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = APP_ROUTE.STRATEGY;
  nextPath: string =
    `${APP_ROUTE.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_VDO}`;

  constructor(
    private readonly _navigationHistoryService: NavigationHistoryService,
  ) {}

  ngOnInit(): void {
    const strategyPath = APP_ROUTE.STRATEGY;
    const vdoPath = `${APP_ROUTE.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_VDO}`;
    const previousPath = this._navigationHistoryService.getPreviousPath();

    if (previousPath === vdoPath) {
      this.backPath = vdoPath;
      this.nextPath = APP_ROUTE.DASHBOARD;
      return;
    }

    this.backPath = strategyPath;
    this.nextPath = vdoPath;
  }
}
