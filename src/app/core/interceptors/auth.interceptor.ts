import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const accessToken = tokenService.getAccessToken();

  const withToken = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  return next(withToken).pipe(
    catchError((error: HttpErrorResponse) => {
      const refreshToken = tokenService.getRefreshToken();
      const isAuthRoute =
        req.url.includes('/accounts/jwt/login/') || req.url.includes('/accounts/jwt/refresh/');

      if (error.status !== 401 || !refreshToken || isAuthRoute) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((response) => {
          tokenService.setTokens(response.access, refreshToken);
          const retried = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.access}`,
            },
          });
          return next(retried);
        }),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
