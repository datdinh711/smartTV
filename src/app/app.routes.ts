import { Routes } from '@angular/router';
import { APP_ROUTES } from '@core/constants';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { WelcomeComponent } from '@features/welcome/welcome.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: APP_ROUTES.WELCOME,
        loadComponent: () => WelcomeComponent,
        pathMatch: 'full',
      },
      {
        path: APP_ROUTES.DASHBOARD,
        loadComponent: () => DashboardComponent,
      },
      {
        path: APP_ROUTES.INTRODUCTION,
        loadChildren: () =>
          import('./features/introduction/introduction.routes').then(
            (r) => r.routes,
          ),
      },
      {
        path: APP_ROUTES.STRATEGY,
        loadChildren: () =>
          import('./features/strategy/strategy.routes').then((r) => r.routes),
      },
    ],
  },
];
