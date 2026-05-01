import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthUser, JwtLoginResponse, JwtRefreshResponse } from '../models/auth.model';
import { RegisterPayload } from '../models/register.model';
import { TokenService } from './token.service';
import { FavoritesService } from './favorites.service';

type LoginPayload = {
  email: string;
  password: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly authReadyState = signal(false);
  private readonly accessTokenState = signal(this.tokenService.hasAccessToken());
  private readonly favoritesService = inject(FavoritesService);

  readonly user = computed(() => this.userState());
  readonly isAuthReady = computed(() => this.authReadyState());
  readonly isAuthenticated = computed(() => this.accessTokenState());

  login(payload: LoginPayload): Observable<JwtLoginResponse> {
    return this.http.post<JwtLoginResponse>(`${API_BASE_URL}/accounts/jwt/login/`, payload).pipe(
      tap((response) => {
        this.tokenService.setTokens(response.access, response.refresh);
        this.accessTokenState.set(true);
        this.userState.set(response.user);
        this.authReadyState.set(true);
      }),
    );
  }

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${API_BASE_URL}/accounts/register/`, payload);
  }

  refresh(): Observable<JwtRefreshResponse> {
    return this.http.post<JwtRefreshResponse>(`${API_BASE_URL}/accounts/jwt/refresh/`, {
      refresh: this.tokenService.getRefreshToken(),
    });
  }

  loadMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${API_BASE_URL}/accounts/me/`).pipe(
      tap((user) => {
        this.userState.set(user);
      }),
    );
  }

  initialize(): void {
    if (!this.tokenService.hasAccessToken()) {
      this.authReadyState.set(true);
      return;
    }

    this.loadMe()
      .pipe(
        catchError(() => {
          this.logout();
          return EMPTY;
        }),
        finalize(() => {
          this.authReadyState.set(true);
        }),
      )
      .subscribe();
  }
  logout(): void {
    this.tokenService.clearTokens();
    this.accessTokenState.set(false);
    this.userState.set(null);
    this.authReadyState.set(true);
    this.favoritesService.clear();
  }
}
