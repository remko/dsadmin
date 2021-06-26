import type { Key as APIKey } from "./api";

export type Key = {
  project?: string;
  namespace?: string;
  path: Array<{
    kind: string;
    id: string | number;
  }>;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Key expression tokenizer
//////////////////////////////////////////////////////////////////////////////////////////////////////

export type Token =
  | { symbol: "(" }
  | { symbol: ")" }
  | { symbol: "," }
  | {
      identifier: string;
    }
  | {
      string: string;
    }
  | { integer: number };

function tokenToString(token: Token) {
  return JSON.stringify(token);
}

function isSpace(c: string) {
  const cc = c.charCodeAt(0);
  return cc == 0x20;
}

function isAlpha(c: string) {
  const cc = c.charCodeAt(0);
  return (cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122);
}

function isNumeric(c: string) {
  const cc = c.charCodeAt(0);
  return cc >= 48 && cc <= 57;
}

export function* tokenize(s: string): Generator<Token, void, unknown> {
  let pos = 0;
  const end = s.length;

  const readChar = () => {
    if (pos >= end) {
      return null;
    }
    const ch = s.charAt(pos);
    pos += 1;
    return ch;
  };

  let ch = readChar();
  while (ch != null) {
    if (ch === "(" || ch === ")" || ch === ",") {
      yield { symbol: ch };
      ch = readChar();
      continue;
    }

    if (isSpace(ch)) {
      ch = readChar();
      continue;
    }

    // Identifier
    if (isAlpha(ch)) {
      const identifier: string[] = [ch];
      while ((ch = readChar()) != null && isAlpha(ch)) {
        identifier.push(ch);
      }
      yield { identifier: identifier.join("") };
      continue;
    }

    // Quoted identifier
    if (ch === "`") {
      const identifier: string[] = [];
      while ((ch = readChar()) != null && ch !== "`") {
        identifier.push(ch);
      }
      if (ch == null) {
        throw new Error(`unfinished identifier`);
      }
      yield { identifier: identifier.join("") };
      ch = readChar();
      continue;
    }

    // Integer
    if (isNumeric(ch)) {
      let integer = ch.charCodeAt(0) - 48;
      while ((ch = readChar()) != null && isNumeric(ch)) {
        integer = integer * 10 + (ch.charCodeAt(0) - 48);
      }
      yield { integer };
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const delim = ch;
      const string: string[] = [];
      while ((ch = readChar()) != null && ch !== delim) {
        string.push(ch);
      }
      if (ch == null) {
        throw new Error(`unfinished string`);
      }
      yield { string: string.join("") };
      ch = readChar();
      continue;
    }

    throw new Error(`unexpected character: ${ch}`);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Key expression parser
//////////////////////////////////////////////////////////////////////////////////////////////////////

function isIdentifier(token: Token | undefined, identifier: string) {
  return (
    token != null &&
    "identifier" in token &&
    token.identifier.toLowerCase() === identifier.toLowerCase()
  );
}

function isSymbol(token: Token | undefined, symbol: string) {
  return token != null && "symbol" in token && token.symbol === symbol;
}

export function parse(s: string): Key {
  let tokens = Array.from(tokenize(s));
  const key: Key = { path: [] };

  // key(...)
  if (
    !isIdentifier(tokens.shift(), "key") ||
    !isSymbol(tokens.shift(), "(") ||
    !isSymbol(tokens.pop(), ")")
  ) {
    throw new Error("invalid key");
  }

  // project
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (
      isSymbol(tokens[1], "(") &&
      "string" in tokens[2] &&
      isSymbol(tokens[3], ")") &&
      isSymbol(tokens[4], ",")
    ) {
      if (isIdentifier(tokens[0], "project")) {
        key.project = tokens[2].string;
        tokens = tokens.slice(5);
      } else if (isIdentifier(tokens[0], "namespace")) {
        key.namespace = tokens[2].string;
        tokens = tokens.slice(5);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (tokens.length < 3) {
      throw new Error("expected path");
    }
    if (!("identifier" in tokens[0])) {
      throw new Error("expected kind");
    }
    if (!isSymbol(tokens[1], ",")) {
      throw new Error(`expected comma, got ${tokenToString(tokens[1])}`);
    }
    if ("integer" in tokens[2]) {
      key.path.push({ kind: tokens[0].identifier, id: tokens[2].integer });
    } else if ("string" in tokens[2]) {
      key.path.push({ kind: tokens[0].identifier, id: tokens[2].string });
    } else {
      throw new Error("expected identifier");
    }
    tokens.shift();
    tokens.shift();
    tokens.shift();
    if (tokens.length === 0) {
      break;
    } else if (isSymbol(tokens[0], ",")) {
      tokens.shift();
    } else {
      throw new Error(`expected end or comma, got ${tokenToString(tokens[0])}`);
    }
  }

  if (tokens.length > 0) {
    throw new Error("expected end");
  }

  if (key.path.length === 0) {
    throw new Error("empty path");
  }

  return key;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Key string conversions
//////////////////////////////////////////////////////////////////////////////////////////////////////

export function keyFromString(
  s: string,
  project: string,
  namespace: string | null,
): APIKey {
  let key: Key;
  try {
    key = parse(s);
  } catch (e) {
    throw new Error("invalid key");
  }
  const namespaceId = key.namespace == "" ? null : key.namespace ?? namespace;
  return {
    partitionId: {
      projectId: key.project ?? project,
      ...(namespaceId == null ? {} : { namespaceId }),
    },
    path: key.path.map(({ kind, id }) => ({
      kind,
      ...(typeof id === "number" ? { id: id + "" } : { name: id }),
    })),
  };
}

export function keyToString(
  key: APIKey,
  project: string,
  namespace: string | null,
): string {
  const result: string[] = [];
  if (key.partitionId.projectId !== project) {
    result.push(`PROJECT('${key.partitionId.projectId}')`);
  }
  if ((key.partitionId.namespaceId || null) !== namespace) {
    result.push(`NAMESPACE('${key.partitionId.namespaceId || ""}')`);
  }
  for (const { kind, id, name } of key.path) {
    if (kind.indexOf("'") >= 0 || kind.indexOf(" ") >= 0) {
      result.push(`\`${kind}\``);
    } else {
      result.push(kind);
    }
    if (name != null) {
      result.push(`'${name}'`);
    } else {
      result.push(id!);
    }
  }
  return `key(${result.join(", ")})`;
}
