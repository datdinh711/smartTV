import { Component } from '@angular/core';
import { APP_ROUTES } from '@core/constants';
import { NavigatorService } from '@core/services';
import { STRATEGY_ROUTES } from '@features/strategy/constants/strategy-route.constant';
import { TranslateService } from '@ngx-translate/core';
import {
  NavigationButtonComponent,
  VideoPlayerComponent
} from '@shared/components';

@Component({
  selector: 'app-sustainability-vdo',
  standalone: true,
  imports: [NavigationButtonComponent, VideoPlayerComponent],
  templateUrl: './sustainability-vdo.component.html',
  styleUrl: './sustainability-vdo.component.scss',
})
export class SustainabilityVdoComponent {
  farmingPillarsPath = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;

  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_STRATEGY}`;
  nextPath: string =
    `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _translate: TranslateService,
  ) { }

  get videoSrc(): string {
    return this._translate.getCurrentLang() === 'en'
      ? 'assets/videos/Sustainability_VDO_2026_EN_sub.mp4'
      : 'assets/videos/Sustainability_VDO_2026_VN_sub.mp4';
  }

  onVideoEnded(): void {
    this._navigatorService.goToPath(this.nextPath);
  }
}
