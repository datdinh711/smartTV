import { Routes } from '@angular/router';
import { APP_ROUTE } from '@core/constants';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { SlideshowComponent } from '@features/slideshow/slideshow.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        redirectTo: APP_ROUTE.DASHBOARD,
        pathMatch: 'full',
      },
      {
        path: APP_ROUTE.DASHBOARD,
        loadComponent: () => DashboardComponent,
      },
      {
        path: APP_ROUTE.INFO,
        loadChildren: () =>
          import('./features/information/information.routes').then(
            (r) => r.routes,
          ),
      },
      {
        path: APP_ROUTE.SLIDESHOW,
        loadComponent: () => SlideshowComponent,
      },
    ],
  },
];
