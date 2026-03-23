import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { APP_ROUTES } from '@core/constants';
import { BUSINESS_PATH } from '@features/business/constants';
import { NavigationButtonComponent } from '@shared/components';

@Component({
  selector: 'app-sustainovation-business',
  standalone: true,
  imports: [NavigationButtonComponent, CommonModule],
  templateUrl: './sustainovation-business.component.html',
  styleUrl: './sustainovation-business.component.scss',
})
export class SustainovationBusinessComponent {
  farmingPillarsPath = `${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.BIOSECURITY_ANIMAL_WELFARE}`;

  APP_ROUTE = APP_ROUTES;
}
