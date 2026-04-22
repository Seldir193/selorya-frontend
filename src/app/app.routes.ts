import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomePage } from './features/home.page';
import { LoginPage } from './features/auth/pages/login.page';
import { ListingsPage } from './features/listings/pages/listings.page';
import { ListingDetailPage } from './features/listings/pages/listing-detail.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'listings',
    component: ListingsPage,
  },
  {
    path: 'listings/:slug',
    component: ListingDetailPage,
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home.page').then((m) => m.HomePage),
  },
];
