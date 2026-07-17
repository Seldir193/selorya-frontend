import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it.each(['payments', 'shipping'])('redirects /%s to the order overview', (path) => {
    expect(routes.find((route) => route.path === path)).toMatchObject({
      redirectTo: 'orders',
      pathMatch: 'full',
    });
  });
});
