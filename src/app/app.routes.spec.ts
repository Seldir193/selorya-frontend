import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it('provides the protected payment overview', () => {
    expect(routes.find((route) => route.path === 'payments')).toMatchObject({
      path: 'payments',
      canActivate: expect.any(Array),
      loadComponent: expect.any(Function),
    });
  });

  it('provides the protected shipping overview', () => {
    expect(routes.find((route) => route.path === 'shipping')).toMatchObject({
      path: 'shipping',
      canActivate: expect.any(Array),
      loadComponent: expect.any(Function),
    });
  });
});
