import { VariableToken } from "../router/token/VariableToken";
import { Token } from "../router/token/Token";
import { TextToken } from "../router/token/TextToken";

export function isTextToken(token: Token): token is TextToken {
  return (token as TextToken).text !== undefined;
}

export function isVariableToken(token: Token): token is VariableToken {
  return (token as VariableToken).name !== undefined;
}
