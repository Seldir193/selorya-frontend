import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthUser } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = authService.user();

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (user) {
    return adminAccess(user, router);
  }

  return authService.loadMe().pipe(
    map((currentUser) => adminAccess(currentUser, router)),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};

function adminAccess(user: AuthUser, router: Router): boolean | UrlTree {
  return user.role === 'admin' ? true : router.createUrlTree(['/']);
}
