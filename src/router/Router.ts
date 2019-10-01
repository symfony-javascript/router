import { RouterInterface } from "./RouterInterface";
import { RouterSettings } from "./RouterSettings";
import { RouteCollection } from "./RouteCollection";
import { Token } from "./token/Token";
import { Scheme } from "./Scheme";
import { Route } from "./Route";
import { Variable } from "./Variable";
import { Requirement } from "./Requirement";
import { isTextToken, isVariableToken } from "../utils/token";

export const DefaultSettings: RouterSettings = {
  data: {},
  debug: false,
  forceHttps: false,
  forceCurrentScheme: false,
  fallbackScheme: 'https',
  fallbackBaseUrl: '',
  fallbackHost: '',
};

export class Router implements RouterInterface {
  public settings: RouterSettings;
  public collection: RouteCollection | undefined;

  private initialized: boolean;

  constructor(settings?: RouterSettings) {
      this.settings = { ...DefaultSettings, ...settings };
      this.initialized = false;

      this.initialize();
  }

  public getCollection(): RouteCollection {
      this.throwIfNotInitialized();

      return <RouteCollection>this.collection;
  }

  private initialize() {
      if (this.initialized) {
          throw new Error('The Router is already initialized.');
      }

      this.collection = this.parseCollection(this.settings.data);
      this.initialized = true;
  }

  private throwIfNotInitialized() {
      if (!this.initialized) {
          throw new Error('The Router is not initialized.');
      }
  }

  private parseTokens(data: any): Token[] {
      let tokens: Token[] = [];

      for (let [name, value] of Object.entries<string[]>(data)) {
          if ('variable' === value[0]) {
              tokens.push({
                  prefix: value[1],
                  regex: value[2],
                  name: value[3],
                  utf8: JSON.parse(value[4]),
              });
          } else if ('text' === value[0]) {
              tokens.push({ text: value[1] });
          } else {
              console.warn(`Unknown route token type '${value[0]}'.`);
          }
      }

      return tokens;
  }

  private parseCollection(data: any): RouteCollection {
      let scheme: Scheme = data.scheme || this.settings.fallbackScheme,
          routes: Route[] = [];

      if (this.settings.forceHttps && !this.settings.forceCurrentScheme) {
          scheme = 'https';
      } else if (this.settings.forceCurrentScheme) {
          let current = location.protocol.replace(':', '');

          if (!current) {
              console.warn(`The current scheme could not be retrieved. Defaulting to ${scheme}.`);
          }

          scheme = location.protocol.replace(':', '') || scheme;
      }

      if (!data.routes) {
          console.warn(`No routes were retrieved.`);
      } else {
          for (let [name, route] of Object.entries<any>(data.routes)) {
              let path: string = route.path,
                  host: string = route.host,
                  schemes: string[] = route.schemes,
                  condition: string = route.condition,
                  methods: string[] = route.methods,
                  hostTokens: Token[] = this.parseTokens(route.host_tokens),
                  defaults: Variable[] = [],
                  tokens: Token[] = this.parseTokens(route.tokens),
                  requirements: Requirement[] = [];

              for (let [name, value] of Object.entries<any>(route.defaults)) {
                  defaults.push({ name, value });
              }

              for (let [name, value] of Object.entries<any>(route.requirements)) {
                  requirements.push({ name, regex: value });
              }

              routes.push({
                  requirements,
                  name,
                  path,
                  host,
                  schemes,
                  condition,
                  methods,
                  hostTokens,
                  defaults,
                  tokens,
              });
          }
      }

      const collection: RouteCollection = {
          baseUrl: data.base_url || this.settings.fallbackBaseUrl,
          host: data.host || this.settings.fallbackHost,
          logoutPath: data.logout_path || '',
          logoutUrl: data.logout_url || '',
          scheme,
          routes,
      };

      return collection;
  }

  private buildQueryParameters(key: string, parameters: string | string[] | any, add: Function) {
      let brackets = new RegExp(/\[\]$/),
          name: string;

      if (Array.isArray(parameters)) {
          parameters.forEach((value: string, index: number) => {
              if (brackets.test(key)) {
                  add(key, value);
              } else {
                  this.buildQueryParameters(`${key}[${'object' !== typeof value ? index : Object.keys(value)[index]}]`, value, add);
              }
          });
      } else if ('object' === typeof parameters) {
          for (name in parameters) {
              this.buildQueryParameters(`${key}[${name}]`, parameters[name], add);
          }
      } else {
          add(key, parameters);
      }
  }

  private getQueryParameters(parameters: any): string {
      if (0 === Object.keys(parameters).length) {
          return '';
      }

      let _format: string[] = [],
          add = (key: string, value: any) => {
              value = 'function' === typeof value ? value() : value;
              value = null === value ? '' : value;

              if (Array.isArray(value)) {
                  value = value.join(',');
              }

              _format.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
          };

      for (let key in parameters) {
          this.buildQueryParameters(key, parameters[key], add);
      }

      return `?${_format.join('&').replace('/%20/g', '+')}`;
  }

  public url(name: string, parameters: any = {}, schemeRelative: boolean = false): string {
      this.throwIfNotInitialized();

      if (0 === name.length) {
          console.warn('The Route name must not be empty.');
          return '';
      }

      let route = this.getCollection().routes.find(route => route.name == name),
          schemeAndHost = '',
          host = '';

      if (!route) {
          console.warn(`No route which name is ${name} was found.`);
          return '';
      }

      route.hostTokens.forEach((token: Token) => {
          if (isTextToken(token)) {
              host = token.text + host;
          } else if (isVariableToken(token)) {
              let value: string = '';

              if (token.name in parameters) {
                  value = parameters[token.name];
              } else {
                  let variable = (<Route>route).defaults.find(variable => variable.name === token.name);

                  if (variable) {
                      value = variable.value;
                  }
              }

              host = token.prefix + value + host;
          } else {
              throw new Error(`Token ${token} is not supported.`);
          }
      });

      let scheme = this.getCollection().scheme,
          routeScheme = route.requirements.find(req => req.name === '_scheme');

      if (routeScheme && scheme !== routeScheme.name) {
          schemeAndHost = `${!schemeRelative ? routeScheme.name + ':' : ''}//${host || this.getCollection().host}`;
      } else if (route.schemes[0] && route.schemes[0] !== scheme) {
          schemeAndHost = `${!schemeRelative ? route.schemes[0] + ':' : ''}//${host || this.getCollection().host}`;
      } else {
          schemeAndHost = `${!schemeRelative ? this.getCollection().scheme + ':' : ''}//${host || this.getCollection().host}`;
      }

      return schemeAndHost + this.path(name, parameters);
  }

  public path(name: string, parameters?: any): string {
      this.throwIfNotInitialized();

      if (0 === name.length) {
          console.warn('The Route name must not be empty.');
          return '';
      }

      let route = this.getCollection().routes.find(route => route.name == name),
          url = '',
          optional = false,
          _params = parameters || {},
          _unused = parameters || {};

      if (!route) {
          console.warn(`No route which name is ${name} was found.`);
          return '';
      }

      route.tokens.forEach((token: Token) => {
          if (isTextToken(token)) {
              url = token.text + url;
              optional = false;

              return;
          }

          if (isVariableToken(token)) {
              let _default = (<Route>route).defaults.find(variables => variables.value === token.name);

              if (false === optional || !_default || (token.name in _params && _params[token.name] != _default)) {
                  let value: any;

                  if (token.name in _params) {
                      value = _params[token.name];
                      delete _unused[token.name];
                  } else if (_default) {
                      value = _default.value;
                  } else if (optional) {
                      return;
                  } else {
                      throw new Error(`The route '${name}' requires the parameter '${token.name}'.`);
                  }

                  let empty = true === value || false === value || '' === value;

                  if (!empty || !optional) {
                      let encoded = encodeURIComponent(value).replace(/%2F/g, '/');

                      if ('null' === encoded && null === value) {
                          encoded = '';
                      }

                      url = token.prefix + encoded + url;
                  }

                  optional = false;
              } else if (_default && token.name in _unused) {
                  delete _unused[token.name];
              }
              return;
          }

          throw new Error(`Token ${token} is not supported.`);
      });

      return this.getCollection().baseUrl + ('' === url ? '/' : url) + this.getQueryParameters(_unused);
  }

  public absoluteUrl(path: string, schemeRelative: boolean = false): string {
      if (path.includes('://') || path.startsWith('//')) {
          return schemeRelative ? path.substr(path.indexOf('//') + 2) : path;
      }

      if (path.startsWith('#')) {
          path = location.pathname + location.search + path;
      } else if (path.startsWith('?')) {
          path = location.pathname + path;
      }

      if (!path || !path.startsWith) {
          let prefix = location.pathname;

          if (!prefix.endsWith('/')) {
              prefix = prefix.substr(0, prefix.lastIndexOf('/')) + '/';
          }

          path = prefix + path;
      }

      return `${schemeRelative ? '' : location.protocol}//` + location.hostname + path;
  }

  public logoutUrl(): string | null {
      this.throwIfNotInitialized();

      if (this.logoutUrl) {
          console.warn('No logout URL was provided. A possible cause is your default firewall not having one.');
          return null;
      }

      return (<RouteCollection>this.collection).logoutUrl;
  }

  public logoutPath(): string | null {
      this.throwIfNotInitialized();

      if (this.logoutPath) {
          console.warn('No logout path was provided. A possible cause is your default firewall not having one.');
          return null;
      }

      return (<RouteCollection>this.collection).logoutUrl;
  }
}
