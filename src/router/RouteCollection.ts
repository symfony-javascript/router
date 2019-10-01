import { Scheme } from "./Scheme";
import { Route } from "./Route";

export interface RouteCollection {
  routes: Route[];
  scheme: Scheme;
  host: string;
  baseUrl: string;
  logoutUrl: string;
  logoutPath: string;
}
