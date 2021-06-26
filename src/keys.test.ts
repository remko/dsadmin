import {
  keyFromString,
  Token,
  tokenize,
  parse,
  Key,
  keyToString,
} from "./keys";
import type { Key as APIKey } from "./api";

function tokenizeAll(v: string) {
  return Array.from<Token>(tokenize(v));
}

const tokenizeTests: Array<{ input: string; expected: Array<Token> }> = [
  {
    input: "key(MyModel,123)",
    expected: [
      { identifier: "key" },
      { symbol: "(" },
      { identifier: "MyModel" },
      { symbol: "," },
      { integer: 123 },
      { symbol: ")" },
    ],
  },
  {
    input: "   key  ( MyModel   ,   123    )    ",
    expected: [
      { identifier: "key" },
      { symbol: "(" },
      { identifier: "MyModel" },
      { symbol: "," },
      { integer: 123 },
      { symbol: ")" },
    ],
  },
  {
    input: "key(`MyModel`,123)",
    expected: [
      { identifier: "key" },
      { symbol: "(" },
      { identifier: "MyModel" },
      { symbol: "," },
      { integer: 123 },
      { symbol: ")" },
    ],
  },
  {
    input: 'key(MyModel,"123\'4,(5)6")',
    expected: [
      { identifier: "key" },
      { symbol: "(" },
      { identifier: "MyModel" },
      { symbol: "," },
      { string: "123'4,(5)6" },
      { symbol: ")" },
    ],
  },
  {
    input: "key(MyModel,'123\"4,(5)6')",
    expected: [
      { identifier: "key" },
      { symbol: "(" },
      { identifier: "MyModel" },
      { symbol: "," },
      { string: '123"4,(5)6' },
      { symbol: ")" },
    ],
  },
  { input: "", expected: [] },
  { input: "   ", expected: [] },
  {
    input: "key(PROJECT(MyProject),NAMESPACE(MyNamespace),MyModel,123)",
    expected: [
      { identifier: "key" },
      { symbol: "(" },
      { identifier: "PROJECT" },
      { symbol: "(" },
      { identifier: "MyProject" },
      { symbol: ")" },
      { symbol: "," },
      { identifier: "NAMESPACE" },
      { symbol: "(" },
      { identifier: "MyNamespace" },
      { symbol: ")" },
      { symbol: "," },
      { identifier: "MyModel" },
      { symbol: "," },
      { integer: 123 },
      { symbol: ")" },
    ],
  },
];

describe("tokenize", () => {
  for (const t of tokenizeTests) {
    const { input, expected } = t;
    test(`tokenizes ${input.replaceAll(" ", "⎵")}`, () => {
      expect(tokenizeAll(input)).toEqual(expected);
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////

const parseTests: Array<{ input: string; expected: Key | null }> = [
  {
    input: "key(MyModel,123)",
    expected: { path: [{ kind: "MyModel", id: 123 }] },
  },
  {
    input: "Key(MyModel,123)",
    expected: { path: [{ kind: "MyModel", id: 123 }] },
  },
  {
    input: "key(MyModel,'123')",
    expected: { path: [{ kind: "MyModel", id: "123" }] },
  },
  {
    input: "key(AncestorModel, 1, MyModel,'123')",
    expected: {
      path: [
        { kind: "AncestorModel", id: 1 },
        { kind: "MyModel", id: "123" },
      ],
    },
  },
  {
    input: "key(PROJECT('MyProject'), NAMESPACE('MyNamespace'), MyModel, 123)",
    expected: {
      project: "MyProject",
      namespace: "MyNamespace",
      path: [{ kind: "MyModel", id: 123 }],
    },
  },
  {
    input: "key(PROJECT('MyProject'), MyModel, 123)",
    expected: { project: "MyProject", path: [{ kind: "MyModel", id: 123 }] },
  },
  {
    input: "key(NAMESPACE('MyNamespace'), MyModel, 123)",
    expected: {
      namespace: "MyNamespace",
      path: [{ kind: "MyModel", id: 123 }],
    },
  },
  {
    input: "key(NAMESPACE(''), MyModel, 123)",
    expected: { namespace: "", path: [{ kind: "MyModel", id: 123 }] },
  },
  {
    input: "keyy(MyModel,123)",
    expected: null,
  },
  {
    input: "keyy MyModel,123)",
    expected: null,
  },
  {
    input: "key(MyModel,123",
    expected: null,
  },
  {
    input: "key(MyModel,123) 123",
    expected: null,
  },
  {
    input: "key",
    expected: null,
  },
  {
    input: "key(MyModel,)",
    expected: null,
  },
  {
    input: "key(MyModel)",
    expected: null,
  },
  {
    input: "key()",
    expected: null,
  },
  {
    input: "key(PROJECT('MyProject'))",
    expected: null,
  },
  {
    input: "key(AncestorModel, MyModel)",
    expected: null,
  },
  {
    input: "key(AncestorModel, 1,  MyModel)",
    expected: null,
  },
];

describe("parse", () => {
  for (const t of parseTests) {
    const { input, expected } = t;
    test(`parses ${input}`, () => {
      if (expected == null) {
        expect(() => parse(input)).toThrowError();
      } else {
        expect(parse(input)).toEqual(expected);
      }
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////

const keyFromStringTests: Array<{
  input: string;
  project: string;
  namespace: string | null;
  expected: APIKey | null;
}> = [
  {
    input: "key(MyModel,123)",
    project: "MyProject",
    namespace: null,
    expected: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
  },
  {
    input: "key(MyModel,'123')",
    project: "MyProject",
    namespace: null,
    expected: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "MyModel",
          name: "123",
        },
      ],
    },
  },
  {
    input: "key(MyModel,123)",
    project: "MyProject",
    namespace: "MyNamespace",
    expected: {
      partitionId: {
        projectId: "MyProject",
        namespaceId: "MyNamespace",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
  },
  {
    input: "key(PROJECT('MyOtherProject'),MyModel,123)",
    project: "MyProject",
    namespace: "MyNamespace",
    expected: {
      partitionId: {
        projectId: "MyOtherProject",
        namespaceId: "MyNamespace",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
  },
  {
    input:
      "key(PROJECT('MyOtherProject'),NAMESPACE('MyOtherNamespace'),MyModel,123)",
    project: "MyProject",
    namespace: "MyNamespace",
    expected: {
      partitionId: {
        projectId: "MyOtherProject",
        namespaceId: "MyOtherNamespace",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
  },
  {
    input: "key(PROJECT('MyOtherProject'),NAMESPACE(''),MyModel,123)",
    project: "MyProject",
    namespace: "MyNamespace",
    expected: {
      partitionId: {
        projectId: "MyOtherProject",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
  },
];

describe("keyFromString", () => {
  for (const t of keyFromStringTests) {
    const { input, project, namespace, expected } = t;
    test(`converts ${input}`, () => {
      if (expected == null) {
        expect(() => keyFromString(input, project, namespace)).toThrowError();
      } else {
        expect(keyFromString(input, project, namespace)).toEqual(expected);
      }
    });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////

const keyToStringTests: Array<{
  input: APIKey;
  project: string;
  namespace: string | null;
  expected: string;
}> = [
  {
    input: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected: "key(MyModel, 123)",
  },
  {
    input: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "MyModel",
          name: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected: "key(MyModel, '123')",
  },
  {
    input: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "AncestorModel",
          name: "foo",
        },
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected: "key(AncestorModel, 'foo', MyModel, 123)",
  },
  {
    input: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "My Model",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected: "key(`My Model`, 123)",
  },
  {
    input: {
      partitionId: {
        projectId: "MyProject",
      },
      path: [
        {
          kind: "My'Model",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected: "key(`My'Model`, 123)",
  },
  {
    input: {
      partitionId: {
        projectId: "MyOtherProject",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected: "key(PROJECT('MyOtherProject'), MyModel, 123)",
  },
  {
    input: {
      partitionId: {
        projectId: "MyOtherProject",
        namespaceId: "MyOtherNamespace",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: null,
    expected:
      "key(PROJECT('MyOtherProject'), NAMESPACE('MyOtherNamespace'), MyModel, 123)",
  },
  {
    input: {
      partitionId: {
        projectId: "MyOtherProject",
      },
      path: [
        {
          kind: "MyModel",
          id: "123",
        },
      ],
    },
    project: "MyProject",
    namespace: "MyNamespace",
    expected: "key(PROJECT('MyOtherProject'), NAMESPACE(''), MyModel, 123)",
  },
];

describe("keyToString", () => {
  for (const t of keyToStringTests) {
    const { input, project, namespace, expected } = t;
    test(`converts ${expected}`, () => {
      if (expected == null) {
        expect(() => keyToString(input, project, namespace)).toThrowError();
      } else {
        expect(keyToString(input, project, namespace)).toEqual(expected);
      }
    });
  }
});
