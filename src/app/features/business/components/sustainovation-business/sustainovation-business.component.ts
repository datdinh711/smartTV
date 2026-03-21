import { Component } from '@angular/core';
import { APP_ROUTES } from '@core/constants';
import { BUSINESS_ROUTES } from '@features/business/constants';
import { NavigationButtonComponent } from '@shared/components';

@Component({
  selector: 'app-sustainovation-business',
  standalone: true,
  imports: [NavigationButtonComponent],
  templateUrl: './sustainovation-business.component.html',
  styleUrl: './sustainovation-business.component.scss',
})
export class SustainovationBusinessComponent {
  farmingPillarsPath = `${APP_ROUTES.BUSINESS}/${BUSINESS_ROUTES.FARMING_PILLARS}`;

  APP_ROUTE = APP_ROUTES;
}
