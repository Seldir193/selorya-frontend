import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it('provides the protected payment overview', () => {
    expect(routes.find((route) => route.path === 'payments')).toMatchObject({
      path: 'payments',
      canActivate: expect.any(Array),
    });
  });

  it('keeps shipping safe until its dedicated page exists', () => {
    expect(routes.find((route) => route.path === 'shipping')).toMatchObject({
      redirectTo: 'orders',
      pathMatch: 'full',
    });
  });
});
