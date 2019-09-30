export function isTextToken(token: Token): token is TextToken {
  return (token as TextToken).text !== undefined;
}

export function isVariableToken(token: Token): token is VariableToken {
  return (token as VariableToken).name !== undefined;
}
