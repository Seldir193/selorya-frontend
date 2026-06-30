import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthUser } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { createAuthUser } from '../../testing/auth-user.fixture';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const authService = {
    user: signal<AuthUser | null>(null),
    isAuthenticated: vi.fn(),
    loadMe: vi.fn(),
  };

  const router = {
    createUrlTree: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authService.user.set(null);
    authService.isAuthenticated.mockReturnValue(false);
    authService.loadMe.mockReturnValue(of(createAuthUser()));

    router.createUrlTree.mockImplementation((commands: unknown[]) => {
      return { commands } as unknown as UrlTree;
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('redirects unauthenticated users to login', () => {
    const result = runGuard();

    expect(result).toEqual({ commands: ['/login'] });
  });

  it('allows a cached admin user', () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.user.set(createAdminUser());

    expect(runGuard()).toBe(true);
    expect(authService.loadMe).not.toHaveBeenCalled();
  });

  it('redirects a cached non-admin user to the start page', () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.user.set(createAuthUser());

    expect(runGuard()).toEqual({ commands: ['/'] });
  });

  it('loads the current user when the authenticated user is not cached', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.loadMe.mockReturnValue(of(createAdminUser()));

    const result = runGuard() as Observable<boolean | UrlTree>;

    await expect(firstValueFrom(result)).resolves.toBe(true);
    expect(authService.loadMe).toHaveBeenCalledOnce();
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => {
      return adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });
  }

  function createAdminUser(): AuthUser {
    return {
      ...createAuthUser(),
      role: 'admin',
    };
  }
});
