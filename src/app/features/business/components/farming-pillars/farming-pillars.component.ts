import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, RouteConfigLoadEnd, Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants';
import { NavigatorService } from '@core/services';
import { BUSINESS_PATH } from '@features/business/constants';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationButtonComponent } from '@shared/components';
import { filter, Subscription } from 'rxjs';
import { AnimalHealthItemDialogComponent } from './dialogs/animal-health-item-dialog/animal-health-item-dialog.component';
import { GreenFarmingDialogComponent } from './dialogs/green-farming-dialog/green-farming-dialog.component';
import { RenewableEnergyDialogComponent } from './dialogs/renewable-energy-dialog/renewable-energy-dialog.component';
import { WastewaterDialogComponent } from './dialogs/wastewater-dialog/wastewater-dialog.component';

@Component({
  selector: 'app-farming-pillars',
  standalone: true,
  imports: [NavigationButtonComponent, CommonModule, RenewableEnergyDialogComponent, WastewaterDialogComponent, GreenFarmingDialogComponent, AnimalHealthItemDialogComponent, TranslateModule],
  templateUrl: './farming-pillars.component.html',
  styleUrl: './farming-pillars.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmingPillarsComponent implements OnInit, OnDestroy {
  menuBar = [
    {
      name: 'Biosecurity & Animal Welfare',
      id: BUSINESS_PATH.BIOSECURITY_ANIMAL_WELFARE,
    },
    {
      name: 'Circular & Green Farm',
      id: BUSINESS_PATH.CIRCULAR,
      subId: BUSINESS_PATH.GREEN_FARMING,
    },
    {
      name: 'Smart Farm',
      id: BUSINESS_PATH.SMART_FARM_TECHNOLOGY,
    },
    {
      name: 'Animal Health Management',
      id: BUSINESS_PATH.ANIMAL_HEALTH_MANAGEMENT,
    },
    {
      name: 'Traceability & Certification',
      id: BUSINESS_PATH.TRACEABILITY,
      subId: BUSINESS_PATH.CERTIFICATION,
    },
  ];
  businessId: string = '';
  currentLang: 'en' | 'vi' = 'vi';

  BUSINESS_PATH = BUSINESS_PATH;
  APP_ROUTES = APP_ROUTES;

  private _preloadedImages: HTMLImageElement[] = [];
  private _langSub?: Subscription;

  isRenewableEnergyDialogOpen = false;
  isWastewaterDialogOpen = false;
  isGreenFarmingDialogOpen = false;
  activeAnimalHealthItem: number | null = null;

  openRenewableEnergyDialog(): void { this.isRenewableEnergyDialogOpen = true; }
  closeRenewableEnergyDialog(): void { this.isRenewableEnergyDialogOpen = false; }

  openWastewaterDialog(): void { this.isWastewaterDialogOpen = true; }
  closeWastewaterDialog(): void { this.isWastewaterDialogOpen = false; }

  openGreenFarmingDialog(): void { this.isGreenFarmingDialogOpen = true; }
  closeGreenFarmingDialog(): void { this.isGreenFarmingDialogOpen = false; }

  openAnimalHealthItemDialog(id: number): void {
    this.activeAnimalHealthItem = id;
    this._cdr.markForCheck();
  }

  closeAnimalHealthItemDialog(): void {
    this.activeAnimalHealthItem = null;
    this._cdr.markForCheck();
  }

  constructor(
    private readonly _router: Router,
    private readonly _navigatorService: NavigatorService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _translate: TranslateService,
  ) { }

  ngOnInit() {
    this._preloadImages();

    // Get url when initial loading
    const initialUrl = this._router.url;
    this.businessId = initialUrl.split('/').pop() ?? '';

    this.currentLang = (this._translate.currentLang ?? this._translate.defaultLang ?? 'vi') as 'en' | 'vi';
    this._langSub = this._translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang as 'en' | 'vi';
      this._cdr.markForCheck();
    });

    this._handleNavigationEnd();
  }

  onSelectMenuBar(id: string) {
    this._navigatorService.goToPath(`${APP_ROUTES.BUSINESS}/${id}`);
  }

  onBack() {
    this._navigatorService.goToPath(APP_ROUTES.BUSINESS);
  }

  ngOnDestroy() {
    this._preloadedImages.forEach((img) => (img.src = ''));
    this._preloadedImages = [];
    this._langSub?.unsubscribe();
  }

  private _handleNavigationEnd() {
    this._router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof RouteConfigLoadEnd,
        ),
      )
      .subscribe((value) => {
        const url = (value as NavigationEnd).url || this._router.url;
        this.businessId = url.split('/').pop() ?? '';
        this._cdr.markForCheck();
      });
  }

  private _preloadImages(): void {
    const images = [
      'assets/images/biosecurity-farm.jpg',
      'assets/images/biosecurity-animal-welfare.jpg',
      'assets/images/renewable-energy.jpg',
      'assets/images/wastewater-treatment.jpg',
      'assets/images/green-farming.jpeg',
      'assets/images/green-farm.png',
      'assets/images/smart-farm-tech-1.jpg',
      'assets/images/smart-farm-tech-2.jpg',
      'assets/images/smart-farm-tech-3.jpg',
      'assets/images/traceability.jpg',
      'assets/images/qr.png',
      'assets/images/qr-1.png',
      'assets/images/certificates.jpg',
    ];
    this._preloadedImages = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }
}
