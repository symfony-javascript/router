/**
 * Your front-end router.
 *
 * @interface RouterInterface
 */
export interface RouterInterface {

  /**
   * Returns the relative URL (without the scheme and host) for the given route.
   * 
   * @param {string} name 
   * @param {object} parameters 
   * @see https://symfony.com/doc/current/reference/twig_reference.html#path
   */
  path(name: string, parameters: object): string;

  /**
   * Returns the absolute URL for the given route.
   * If schemeRelative is enabled, it'll create a scheme-relative URL.
   * 
   * @param {string} name Route name.
   * @param {any} parameters URL or query parameters.
   * @param {boolean} schemeRelative Creates a scheme-relative URL.
   * @see https://symfony.com/doc/current/reference/twig_reference.html#url
   */
  url(name: string, parameters: any, schemeRelative: boolean): string;

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
   * @see https://symfony.com/doc/current/reference/twig_reference.html#absolute-url
   */
  absoluteUrl(path: string, schemeRelative?: boolean): string;

  /**
   * Gets the provided logout URL for the default firewall. If this returns null, your default firewall may not have a logout URL configured.
   * 
   * @see https://symfony.com/doc/current/reference/twig_reference.html#logout-url
   */
  logoutUrl(): string | null;

  /**
   * Gets the provided logout URL's path for the default firewall. If this returns null, your default firewall may not have a logout URL configured.
   * 
   * @see https://symfony.com/doc/current/reference/twig_reference.html#logout-path
   */
  logoutPath(): string | null;
}
