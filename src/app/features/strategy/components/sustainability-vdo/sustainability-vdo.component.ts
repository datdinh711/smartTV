import { Component, OnInit } from '@angular/core';
import { APP_ROUTES } from '@core/constants';
import { NavigationHistoryService, NavigatorService } from '@core/services';
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
  farmingPillarsPath = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;
  videoSrc = 'assets/videos/Cp-vdo.mp4';

  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = APP_ROUTES.STRATEGY;
  nextPath: string =
    `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;

  constructor(
    private readonly _navigationHistoryService: NavigationHistoryService,
    private readonly _navigatorService: NavigatorService,
  ) {}

  ngOnInit(): void {
    const strategyPath = APP_ROUTES.STRATEGY;
    const recognitionPath =
      `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;
    const previousPath = this._navigationHistoryService.getPreviousPath();

    if (previousPath === recognitionPath) {
      this.nextPath = APP_ROUTES.DASHBOARD;
      return;
    }

    this.nextPath = recognitionPath;
  }

  onVideoEnded(): void {
    this._navigatorService.goToPath(this.nextPath);
  }
}
