import { Variable } from "./Variable";
import { Requirement } from "./Requirement";
import { Token } from "./token/Token";

export interface Route {
  name: string;
  path: string;
  host: string;
  defaults: Variable[];
  requirements: Requirement[];
  schemes: string[];
  methods: string[];
  condition: string;
  tokens: Token[];
  hostTokens: Token[];
}
