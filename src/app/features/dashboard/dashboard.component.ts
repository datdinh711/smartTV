import { Component } from '@angular/core';
import { NavigatorService } from '@core/services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor(private readonly _navigatorService: NavigatorService) {}

  onNavigateIntroduction() {
    this._navigatorService.goToIntroduction();
  }

  onNavigateStrategy() {
    this._navigatorService.goToStrategy();
  }

  onNavigateBussiness() {
    this._navigatorService.goToBussiness();
  }

  // onNavigateSlideShow() {
  //   this._navigatorService.goToSlideShow();
  // }
}
