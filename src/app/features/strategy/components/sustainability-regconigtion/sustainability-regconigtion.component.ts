import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { APP_ROUTES } from '@core/constants/app-route.constant';
import { NavigationHistoryService } from '@core/services';
import { STRATEGY_ROUTES } from '@features/strategy/constants/strategy-route.constant';
import { HomeButtonComponent, NavigationButtonComponent } from '@shared/components';


@Component({
  selector: 'app-sustainability-regconigtion',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent],
  templateUrl: './sustainability-regconigtion.component.html',
  styleUrl: './sustainability-regconigtion.component.scss'
})
export class SustainabilityRegconigtionComponent implements OnInit {
  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  backPath: string = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_STRATEGY}`;
  nextPath: string = APP_ROUTES.BUSINESS;

  constructor(
    private readonly _translate: TranslateService,
  ) {}

  get recognitionSvgSrc(): string {
    return this._translate.getCurrentLang() === 'en'
      ? 'assets/svg/Reconigtion-en.svg'
      : 'assets/svg/Reconigtion-vn.svg';
  }

  ngOnInit(): void {;
    const vdoPath = `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_VDO}`;
  }
}
