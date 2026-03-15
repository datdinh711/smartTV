import { Routes } from '@angular/router';
import { APP_ROUTE } from '@core/constants';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { WelcomeComponent } from '@features/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: APP_ROUTE.WELCOME,
        loadComponent: () => WelcomeComponent,
        pathMatch: 'full',
      },
      {
        path: APP_ROUTE.DASHBOARD,
        loadComponent: () => DashboardComponent,
      },
      {
        path: APP_ROUTE.INTRODUCTION,
        loadChildren: () =>
          import('./features/introduction/introduction.routes').then(
            (r) => r.routes,
          ),
      },
      {
        path: APP_ROUTE.STRATEGY,
        loadChildren: () =>
          import('./features/strategy/strategy.routes').then(
            (r) => r.routes,
          ),
      },
      {
        path: APP_ROUTE.BUSSINESS,
        loadChildren: () =>
          import('./features/business/business.routes').then(
            (r) => r.routes,
          ),
      },
    ],
  },
];
