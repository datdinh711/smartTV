import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants';
import { BUSINESS_PATH } from '@features/business/constants';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sustainovation-business',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './sustainovation-business.component.html',
  styleUrl: './sustainovation-business.component.scss',
})
export class SustainovationBusinessComponent {
  farmingPillarsPath = `${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.BIOSECURITY_ANIMAL_WELFARE}`;

  APP_ROUTE = APP_ROUTES;

  constructor(private readonly _router: Router) { }

  onExplore() {
    this._router.navigate([`/${APP_ROUTES.BUSINESS}/${BUSINESS_PATH.BIOSECURITY_ANIMAL_WELFARE}`]);
  }
}
