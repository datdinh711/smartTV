import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NavigatorService } from '@core/services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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

  onNavigateBusiness() {
    this._navigatorService.goToBusiness();
  }
}
