import { Router } from '../src';
import { RouterSettings } from '../dist/router/RouterSettings';
import { RouteCollection } from '../dist/router/RouteCollection';
import data from './routes.json';

let router: Router = new Router({ data, forceHttps: true });

it('correctly parses a routing file', () => {
    router = new Router({ data, forceHttps: true });
    expect(router).toBeInstanceOf(Router);
    expect(router.settings).toMatchObject<RouterSettings>({
        forceHttps: true,
    });
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
    expect(router.path('user_view', { id: 1, test: 'value' })).toBe('/user/1?test=value');

    expect(decodeURIComponent(router.path('user_view', { id: -1, test: { value: 'content' } }))).toBe(
        '/user/-1?test[value]=content'
    );
    expect(decodeURIComponent(router.path('user_view', { id: -1, test: ['value', 'value2'] }))).toBe(
        '/user/-1?test[0]=value&test[1]=value2'
    );
});

it('returns correct absolute url', () => {
    expect(router.url('user_view', { id: 1 })).toBe('https://localhost/user/1');
    expect(router.url('user_view', { id: 1000 })).toBe('https://localhost/user/1000');
    expect(router.url('user_view', { id: 1, test: 'value' })).toBe('https://localhost/user/1?test=value');

    expect(decodeURIComponent(router.url('user_view', { id: -1, test: { value: 'content' } }))).toBe(
        'https://localhost/user/-1?test[value]=content'
    );
    expect(decodeURIComponent(router.url('user_view', { id: -1, test: ['value', 'value2'] }))).toBe(
        'https://localhost/user/-1?test[0]=value&test[1]=value2'
    );
});

it('returns absolute url from path', () => {
    expect(router.absoluteUrl(router.path('user_view', { id: 1 }))).toBe('http://localhost/user/1');
    expect(router.absoluteUrl(router.path('user_view', { id: 1000 }))).toBe('http://localhost/user/1000');
    expect(router.absoluteUrl(router.path('user_view', { id: 1, test: 'value' }))).toBe('http://localhost/user/1?test=value');

    expect(decodeURIComponent(router.absoluteUrl(router.path('user_view', { id: -1, test: { value: 'content' } })))).toBe(
        'http://localhost/user/-1?test[value]=content'
    );
    expect(decodeURIComponent(router.absoluteUrl(router.path('user_view', { id: -1, test: ['value', 'value2'] })))).toBe(
        'http://localhost/user/-1?test[0]=value&test[1]=value2'
    );
});

it('throws error on missing required parameter', () => {
    expect(() => {
        router.path('user_view');
    }).toThrowError(Error);
});

it('respects scheme of absolute url from path', () => {
    router = new Router({ data: { ...data, scheme: 'https' }, forceHttps: true });
    expect(router.absoluteUrl(router.path('user_view', { id: -1 }))).toBe('http://localhost/user/-1'); // local test is http, not https
    expect(router.absoluteUrl(router.path('user_view', { id: -1 }), true)).toBe('//localhost/user/-1');
});

it('respects scheme of absolute url', () => {
    router = new Router({ data: { ...data, scheme: 'http' }, forceHttps: true });
    expect(router.url('user_view', { id: 1 })).toBe('https://localhost/user/1');

    router = new Router({ data: { ...data, scheme: 'https' }, forceHttps: true });
    expect(router.url('user_view', { id: 1 })).toBe('https://localhost/user/1');

    router = new Router({ data: { ...data, scheme: 'http' }, forceHttps: false });
    expect(router.url('user_view', { id: 1 })).toBe('http://localhost/user/1');
});

it('respects host of absolute url', () => {
    router = new Router({ data: { ...data, host: 'somehost.com', scheme: 'https' }, forceHttps: true });
    expect(router.url('user_view', { id: 1 })).toBe('https://somehost.com/user/1');
});
