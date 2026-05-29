import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomePage } from './features/home.page';
import { LoginPage } from './features/auth/pages/login.page';
import { RegisterPage } from './features/auth/pages/register.page';
import { ListingsPage } from './features/listings/pages/listings.page';
import { ListingDetailPage } from './features/listings/pages/listing-detail.page';
import { FavoritesPage } from './features/favorites/pages/favorites.page';
import { OrdersPage } from './features/orders/pages/orders.page';
import { MyListingsPage } from './features/listings/pages/my-listings.page';
import { CreateListingPage } from './features/listings/pages/create-listing.page';
import { CheckoutSuccessPage } from './features/checkout/pages/checkout-success.page';
import { CheckoutCancelPage } from './features/checkout/pages/checkout-cancel.page';
import { DocumentsPage } from './features/documents/pages/documents.page';
import { ProfilePage } from './features/profile/pages/profile.page';
import { EditListingPage } from './features/listings/pages/edit-listing.page';
import { ProfileEditPage } from './features/profile/pages/profile-edit.page';

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
    path: 'register',
    component: RegisterPage,
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
    path: 'favorites',
    component: FavoritesPage,
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    component: OrdersPage,
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    component: DocumentsPage,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [authGuard],
  },
  {
    path: 'my-listings',
    component: MyListingsPage,
    canActivate: [authGuard],
  },
  {
    path: 'sell/create',
    component: CreateListingPage,
    canActivate: [authGuard],
  },
  {
    path: 'checkout/success',
    component: CheckoutSuccessPage,
    canActivate: [authGuard],
  },
  {
    path: 'checkout/cancel',
    component: CheckoutCancelPage,
    canActivate: [authGuard],
  },
  {
    path: 'sell/:slug/edit',
    component: EditListingPage,
    canActivate: [authGuard],
  },

  {
    path: 'profile/edit',
    component: ProfileEditPage,
    canActivate: [authGuard],
  },
];
