import { Component, OnInit } from '@angular/core';
import { APP_ROUTE } from '@core/constants';
import { NavigationHistoryService } from '@core/services';
import { STRATEGY_ROUTES } from '@features/strategy/constants/strategy-route.constant';
import {
  HomeButtonComponent,
  NavigationButtonComponent,
  VideoPlayerComponent,
} from '@shared/components';

@Component({
  selector: 'app-sustainability-vdo',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent, VideoPlayerComponent],
  templateUrl: './sustainability-vdo.component.html',
  styleUrl: './sustainability-vdo.component.scss',
})
export class SustainabilityVdoComponent implements OnInit {
  farmingPillarsPath = `${APP_ROUTE.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;
  videoSrc = 'assets/videos/720p.mp4';

  APP_ROUTE = APP_ROUTE;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = APP_ROUTE.STRATEGY;
  nextPath: string =
    `${APP_ROUTE.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;

  constructor(
    private readonly _navigationHistoryService: NavigationHistoryService,
  ) {}

  ngOnInit(): void {
    const strategyPath = APP_ROUTE.STRATEGY;
    const recognitionPath =
      `${APP_ROUTE.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;
    const previousPath = this._navigationHistoryService.getPreviousPath();

    if (previousPath === recognitionPath) {
      this.backPath = recognitionPath;
      this.nextPath = APP_ROUTE.DASHBOARD;
      return;
    }

    this.backPath = strategyPath;
    this.nextPath = recognitionPath;
  }
}
