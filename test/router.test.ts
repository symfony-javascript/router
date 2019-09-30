import Router from '../src';
import data from './routes.json';

let router: Router;

it('parses the route file', () => {
  router = new Router({ data, forceHttps: true });
  expect(router).toBeInstanceOf(Router);
});

it('has correct settings', () => {
  expect(router.settings).toMatchObject<RouterSettings>({
    forceHttps: true,
  });
});

it('has routes', () => {
  expect(router.collection).toMatchObject<RouteCollection>({
    baseUrl: '',
    host: 'localhost',
    logoutPath: '',
    logoutUrl: '',
    scheme: 'https',
    routes: (<RouteCollection>router.collection).routes,
  });
});

it('returns correct path', () => {
  expect(router.path('user_view', { id: 1 })).toBe('/user/1');
  expect(router.path('user_view', { id: 1000 })).toBe('/user/1000');
});

it('throws error on required parameter', () => {
  expect(() => {
    router.path('user_view');
  }).toThrowError(Error);
});
