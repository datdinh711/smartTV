import { Component, Input } from '@angular/core';
import { NavigatorService } from '@core/services';

@Component({
  selector: 'app-home-button',
  standalone: true,
  imports: [],
  templateUrl: './home-button.component.html',
  styleUrl: './home-button.component.scss',
})
export class HomeButtonComponent {
  @Input() label: string = 'Home';
  @Input() destPath: string = '';

  constructor(private readonly _navigatorService: NavigatorService) {}

  onNavigate(): void {
    if (this.destPath) {
      this._navigatorService.goToPath(this.destPath);
      return;
    }

    this._navigatorService.goToDashboard();
  }
}
