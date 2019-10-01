import { TextToken } from "./TextToken";
import { VariableToken } from "./VariableToken";

export type TokenType = 'variable' | 'text';
export type Token = TextToken | VariableToken;
