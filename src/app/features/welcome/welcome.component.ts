import { Component } from '@angular/core';
import { NavigatorService } from '@core/services';

@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  constructor(private readonly _navigatorService: NavigatorService) {}

  onNavigateDashboard() {
    this._navigatorService.goToDashboard();
  }
}
