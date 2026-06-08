import { Component } from '@angular/core';
import { APP_ROUTES } from '@core/constants/app-route.constant';
import { STRATEGY_ROUTES } from '@features/strategy/constants/strategy-route.constant';
import { TranslateModule } from '@ngx-translate/core';
import { HomeButtonComponent, NavigationButtonComponent } from '@shared/components';


@Component({
  selector: 'app-sustainability-cpf',
  standalone: true,
  imports: [NavigationButtonComponent, HomeButtonComponent, TranslateModule],
  templateUrl: './sustainability-cpf.component.html',
  styleUrls: ['./sustainability-cpf.component.scss']
})
export class SustainabilityCpfComponent {
  APP_ROUTE = APP_ROUTES;
  STRATEGY_ROUTE = STRATEGY_ROUTES;

  nextPath: string =
    `${APP_ROUTES.STRATEGY}/${STRATEGY_ROUTES.SUSTAINABILITY_STRATEGY}`;

  quoteText = "";
}
