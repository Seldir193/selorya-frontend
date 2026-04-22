import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthUser, JwtLoginResponse, JwtRefreshResponse } from '../models/auth.model';
import { RegisterPayload } from '../models/register.model';
import { TokenService } from './token.service';

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

  readonly user = computed(() => this.userState());
  readonly isAuthenticated = computed(() => this.tokenService.hasAccessToken());

  login(payload: LoginPayload): Observable<JwtLoginResponse> {
    return this.http.post<JwtLoginResponse>(`${API_BASE_URL}/accounts/jwt/login/`, payload).pipe(
      tap((response) => {
        this.tokenService.setTokens(response.access, response.refresh);
        this.userState.set(response.user);
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
      return;
    }

    this.loadMe()
      .pipe(
        catchError(() => {
          this.logout();
          return EMPTY;
        }),
      )
      .subscribe();
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.userState.set(null);
  }
}
