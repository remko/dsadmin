import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";

export type Error = {
  message: string;
  code: number;
  status: string;
};

export type Key = {
  partitionId: {
    projectId: string;
    namespaceId?: string;
  };
  path: Array<{
    kind: string;
    name?: string;
    id?: string;
  }>;
};

type StringPropertyValue = {
  stringValue: string;
};

type TimestampPropertyValue = {
  timestampValue: string;
};

type KeyPropertyValue = {
  keyValue: Key;
};

type NullPropertyValue = {
  nullValue: never;
};

type BooleanPropertyValue = {
  booleanValue: boolean;
};

type ArrayValue = {
  arrayValue: {
    values?: PropertyValue[];
  };
};

type IntegerValue = {
  integerValue: string;
};

type BlobValue = {
  blobValue: string;
};

export type PropertyValue =
  | TimestampPropertyValue
  | StringPropertyValue
  | KeyPropertyValue
  | NullPropertyValue
  | BooleanPropertyValue
  | ArrayValue
  | IntegerValue
  | BlobValue;

export type Entity = {
  key: Key;
  properties: Record<string, PropertyValue>;
};

const APIContext = React.createContext<{ project: string } | null>(null);

export function APIProvider({
  project,
  children,
}: {
  project: string;
  children: React.ReactNode;
}) {
  return (
    <APIContext.Provider value={{ project }}>{children}</APIContext.Provider>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////
// Datastore REST API
// https://cloud.google.com/datastore/docs/reference/data/rest
////////////////////////////////////////////////////////////////////////////////////////////

async function callAPI<REQUEST_TYPE, RESPONSE_TYPE>(
  project: string,
  method: string,
  request: REQUEST_TYPE,
) {
  const r = await fetch(`/v1/projects/${project}:${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!r.ok) {
    throw (await r.json()).error;
  }
  return r.json() as Promise<RESPONSE_TYPE>;
}

async function runQuery(project: string, query: any) {
  return callAPI<any, any>(project, "runQuery", query);
}

async function lookup(project: string, req: any) {
  return callAPI<any, any>(project, "lookup", req);
}

async function commit(project: string, req: any) {
  return callAPI<any, any>(project, "commit", req);
}

async function import_(project: string, req: any) {
  return callAPI<any, any>(project, "import", req);
}

async function export_(project: string, req: any) {
  return callAPI<any, any>(project, "export", req);
}

////////////////////////////////////////////////////////////////////////////////////////////
// React-Query wrappers
////////////////////////////////////////////////////////////////////////////////////////////

export function useKinds() {
  const { project } = React.useContext(APIContext)!;
  return useQuery<string[], Error>("kinds", async () => {
    const r = await runQuery(project, {
      query: {
        kind: [{ name: "__kind__" }],
      },
    });
    return (r.batch.entityResults || []).map(
      (e: any) => e.entity.key.path[0].name,
    );
  });
}

export function useEntities(kind: string, pageSize: number, page?: number) {
  const { project } = React.useContext(APIContext)!;
  return useQuery<Entity[], Error>(
    ["kinds", kind, "entities", [{ page, pageSize }]],
    async () => {
      const r = await runQuery(project, {
        query: {
          kind: [{ name: kind }],
          limit: pageSize,
          offset: (page ?? 0) * pageSize,
        },
      });
      return (r.batch.entityResults || []).map((e: any) => e.entity);
    },
    { keepPreviousData: true },
  );
}

export function useGQLQuery(query: string) {
  const { project } = React.useContext(APIContext)!;
  return useQuery<Entity[], Error>(
    ["queries", query],
    async () => {
      const r = await runQuery(project, {
        gqlQuery: {
          queryString: query,
          allowLiterals: true,
        },
      });
      return (r.batch.entityResults || []).map((e: any) => e.entity);
    },
    { enabled: query !== "" },
  );
}

export function useEntity(key: Key) {
  const { project } = React.useContext(APIContext)!;
  return useQuery<Entity, Error>(["entities", key], async () => {
    const r = await lookup(project, {
      keys: [key],
    });
    return r.found[0].entity;
  });
}

export function useDeleteEntities() {
  const queryClient = useQueryClient();
  const { project } = React.useContext(APIContext)!;
  return useMutation<void, Error, { keys: Key[] }>(
    ({ keys }) =>
      commit(project, {
        mode: "NON_TRANSACTIONAL",
        mutations: keys.map((key) => ({
          delete: key,
        })),
      }),
    {
      onSuccess: (data, { keys }) => {
        for (const key of keys) {
          queryClient.invalidateQueries([
            "kinds",
            key.path[key.path.length - 1].kind,
            "entities",
          ]);
        }
        queryClient.invalidateQueries(["queries"]);
      },
    },
  );
}

export function useExport() {
  const { project } = React.useContext(APIContext)!;
  return useMutation<{ outputURL: string }, Error, { outputPath: string }>(
    async ({ outputPath }) => {
      const r = await export_(project, {
        output_url_prefix: outputPath + "/",
      });
      return {
        outputURL: r.response.outputUrl,
      };
    },
  );
}

export function useImport() {
  const queryClient = useQueryClient();
  const { project } = React.useContext(APIContext)!;
  return useMutation<void, Error, { inputPath: string }>(
    ({ inputPath }) =>
      import_(project, {
        input_url: inputPath,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  );
}

////////////////////////////////////////////////////////////////////////////////////////////
// Utility
////////////////////////////////////////////////////////////////////////////////////////////

export function keyToLocalString(key: Key) {
  const p = key.path[0];
  if (p.name != null) {
    return `"${p.name}"`;
  } else {
    return p.id!;
  }
}

export function keyToString(key: Key) {
  return key.path
    .map((p) => {
      const id = p.name != null ? `"${p.name}"` : p.id;
      return `${p.kind}:${id}`;
    })
    .join("/");
}

export function encodeKey(key: Key) {
  const encodedKey: EncodedKey = [
    key.partitionId.projectId,
    key.partitionId.namespaceId || "",
    key.path.map((p) => [
      p.kind,
      p.name != null ? p.name : parseInt(p.id!, 10),
    ]),
  ];
  return btoa(JSON.stringify(encodedKey));
}

type EncodedKey = [
  project: string,
  namespace: string,
  path: Array<[kind: string, id: number | string]>,
];

export function decodeKey(encoded: string): Key {
  const [project, namespace, path] = JSON.parse(atob(encoded)) as EncodedKey;
  return {
    partitionId: {
      projectId: project,
      ...(namespace == "" ? {} : { namespaceId: namespace }),
    },
    path: path.map((p) => ({
      kind: p[0],
      ...(Number.isInteger(p[1])
        ? { id: p[1] + "" }
        : { name: p[1] as string }),
    })),
  };
}
