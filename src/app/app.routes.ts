import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { LoginPage } from './features/auth/pages/login.page';
import { RegisterPage } from './features/auth/pages/register.page';
import { CheckoutCancelPage } from './features/checkout/pages/checkout-cancel.page';
import { CheckoutPage } from './features/checkout/pages/checkout.page';
import { CheckoutSuccessPage } from './features/checkout/pages/checkout-success.page';
import { DocumentsPage } from './features/documents/pages/documents.page';
import { FavoritesPage } from './features/favorites/pages/favorites.page';
import { HomePage } from './features/home.page';
import { CreateListingPage } from './features/listings/pages/create-listing.page';
import { EditListingPage } from './features/listings/pages/edit-listing.page';
import { ListingDetailPage } from './features/listings/pages/listing-detail.page';
import { ListingsPage } from './features/listings/pages/listings.page';
import { MyListingsPage } from './features/listings/pages/my-listings.page';
import { OrdersPage } from './features/orders/pages/orders.page';
import { CommercialProfilePage } from './features/profile/pages/commercial-profile.page';
import { ProfileEditPage } from './features/profile/pages/profile-edit.page';
import { ProfilePage } from './features/profile/pages/profile.page';

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
    path: 'payments/payouts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/payments/pages/payouts.page').then((module) => module.PayoutsPage),
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/payments/pages/payments.page').then((module) => module.PaymentsPage),
  },
  {
    path: 'shipping',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shipping/pages/shipping.page').then((module) => module.ShippingPage),
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
    path: 'profile/edit',
    component: ProfileEditPage,
    canActivate: [authGuard],
  },
  {
    path: 'profile/commercial',
    component: CommercialProfilePage,
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
    path: 'sell/:slug/edit',
    component: EditListingPage,
    canActivate: [authGuard],
  },
  {
    path: 'checkout/:provider/:slug',
    component: CheckoutPage,
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
    path: 'admin/payouts',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-payouts.page').then((module) => module.AdminPayoutsPage),
  },
  {
    path: 'admin/commercial-sellers',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-commercial-sellers.page').then(
        (module) => module.AdminCommercialSellersPage,
      ),
  },
  {
    path: 'admin/listing-moderation',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-listing-moderation.page').then(
        (module) => module.AdminListingModerationPage,
      ),
  },
];
