import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';
import { NavigatorService } from '@core/services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, QRCodeModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  qrWidth = 140;

  constructor(private readonly _navigatorService: NavigatorService) {}

  ngOnInit() {
    this._updateQrWidth();
  }

  @HostListener('window:resize')
  _updateQrWidth() {
    const w = window.innerWidth;
    if (w >= 3840) this.qrWidth = Math.round(160 * 2.4);
    else if (w >= 2560) this.qrWidth = Math.round(160 * 1.9);
    else if (w >= 2200) this.qrWidth = Math.round(160 * 1.6);
    else if (w >= 1600) this.qrWidth = Math.round(160 * 1.3);
    else if (w >= 1024) this.qrWidth = 160;
    else if (w >= 480)  this.qrWidth = 120;
    else                this.qrWidth = 90;
  }

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
