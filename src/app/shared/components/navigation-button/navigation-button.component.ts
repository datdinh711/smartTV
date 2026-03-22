import { Component, Input } from '@angular/core';
import { NavigatorService } from '@core/services';

@Component({
  selector: 'app-navigation-button',
  standalone: true,
  imports: [],
  templateUrl: './navigation-button.component.html',
  styleUrl: './navigation-button.component.scss',
})
export class NavigationButtonComponent {
  @Input() isNext: boolean = true;
  @Input() destPath: string = '';

  constructor(private readonly _navigatorService: NavigatorService) {}

  onNavigate() {
    if (this.destPath) {
      this._navigatorService.goToPath(this.destPath);
    }
  }
}
