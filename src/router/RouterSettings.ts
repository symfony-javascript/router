import { Scheme } from "./Scheme";

/**
 * The required settings for your front-end router.
 *
 * @interface RouterSettings
 */
export interface RouterSettings {

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
