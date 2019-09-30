type Scheme = 'http' | 'https' | string;
type TokenType = 'variable' | 'text';
type Token = TextToken | VariableToken;

/**
 * Your front-end router.
 *
 * @interface RouterInterface
 */
interface RouterInterface {

  /**
   * Returns the relative URL (without the scheme and host) for the given route.
   * 
   * @param {string} name 
   * @param {object} parameters 
   * @see https://symfony.com/doc/current/reference/twig_reference.html#path
   */
  path(name: string, parameters: object): string;

  /**
   * Returns the absolute URL from the passed relative path.
   * If schemeRelative is enabled, it'll create a scheme-relative URL.
   * 
   * Example:
   * ```typescript
   *   path('/test'); // /test
   *   absoluteUrl(path('/test')); // https://hostname.com/test
   *   absoluteUrl(path('/test'), true); // hostname.com/test
   * ```
   * 
   * Warning: this function does not use `Collection`'s host and scheme, but `location.hostname` and `location.protocol`.
   * 
   * @param {string|null} path A relative path.
   * @param {boolean} schemeRelative Creates a scheme-relative URL.
   * @see https://symfony.com/doc/current/reference/twig_reference.html#absolute_url
   */
  absoluteUrl(path: string, schemeRelative?: boolean): string;

  /**
   * Gets the provided logout URL for the default firewall. If this returns null, your default firewall may not have a logout URL configured.
   * 
   * @see https://symfony.com/doc/current/reference/twig_reference.html#logout_url
   */
  logoutUrl(): string | null;

  /**
   * Gets the provided logout URL's path for the default firewall. If this returns null, your default firewall may not have a logout URL configured.
   * 
   * @see https://symfony.com/doc/current/reference/twig_reference.html#logout_path
   */
  logoutPath(): string | null;
}

/**
 * The required settings for your front-end router.
 *
 * @interface RouterSettings
 */
interface RouterSettings {

  /**
   * Data containing the routing informations.
   */
  data?: any;

  /**
   * Enable console debugging.
   */
  debug?: boolean;

  /**
   * Forces HTTPS scheme. No effect if `forceCurrentScheme` is true.
   */
  forceHttps?: boolean;

  /**
   * Sets the URL generator scheme to the current protocol.
   */
  forceCurrentScheme?: boolean;

  /**
   * Sets a fallback scheme if none is provided.
   */
  fallbackScheme?: Scheme;

  /**
   * Sets a fallback base URL if none is provided.
   */
  fallbackBaseUrl?: string;

  /**
   * Sets a fallback host if none is provided.
   */
  fallbackHost?: string | undefined;
}

interface RouteCollection {
  routes: Route[];
  scheme: Scheme;
  host: string;
  baseUrl: string;
  logoutUrl: string;
  logoutPath: string;
}

interface Route {
  name: string;
  path: string;
  host: string;
  defaults: DefaultVariable[];
  requirements: Requirement[];
  schemes: string[];
  methods: string[];
  condition: string;
  tokens: Token[];
  hostTokens: Token[];
}

interface Requirement {
  name: string;
  regex: string;
}

interface DefaultVariable {
  name: string;
  value: string;
}

interface TextToken {
  text: string;
}

interface VariableToken {
  prefix: string;
  regex: string;
  name: string;
  utf8: boolean;
}
