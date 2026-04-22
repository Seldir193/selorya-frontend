import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly accessKey = 'selorya_access_token';
  private readonly refreshKey = 'selorya_refresh_token';

  getAccessToken(): string {
    return localStorage.getItem(this.accessKey) ?? '';
  }

  getRefreshToken(): string {
    return localStorage.getItem(this.refreshKey) ?? '';
  }

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.accessKey, access);
    localStorage.setItem(this.refreshKey, refresh);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
}
