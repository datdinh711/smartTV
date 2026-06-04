import { Component, OnInit } from '@angular/core';
import { APP_ROUTES } from '@core/constants';
import { getVideoVersionFromLanguage, NavigatorService, VideoCacheService } from '@core/services';
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
export class SustainabilityVdoComponent implements OnInit {
  farmingPillarsPath = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;

  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_STRATEGY}`;
  nextPath: string =
    `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_REGCONIGTION}`;
  videoSrc = '';

  constructor(
    private readonly _navigatorService: NavigatorService,
    private readonly _videoCacheService: VideoCacheService,
    private readonly _translate: TranslateService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.videoSrc = await this._videoCacheService.getVideoUrl(
      'sustainability-vdo',
      getVideoVersionFromLanguage(this._translate.currentLang),
    );
  }

  onVideoEnded(): void {
    this._navigatorService.goToPath(this.nextPath);
  }
}
