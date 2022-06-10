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

export type NullPropertyValue = {
  nullValue: null;
};

export type BooleanPropertyValue = {
  booleanValue: boolean;
};

export type IntegerValue = {
  integerValue: string;
};

export type DoubleValue = {
  doubleValue: number;
};

export type StringPropertyValue = {
  stringValue: string;
};

export type TimestampPropertyValue = {
  timestampValue: string;
};

export type KeyPropertyValue = {
  keyValue: Key;
};

export type ArrayValue = {
  arrayValue: {
    values?: PropertyValue[];
  };
};

export type BlobValue = {
  blobValue: string;
};

export type EntityValue = {
  entityValue: Record<string, unknown>;
};

export type GeoPointValue = {
  geoPointValue: {
    latitude?: number;
    longitude?: number;
  };
};

export type PropertyValue = {
  excludeFromIndexes?: boolean;
  meaning?: number;
} & (
  | NullPropertyValue
  | BooleanPropertyValue
  | IntegerValue
  | DoubleValue
  | TimestampPropertyValue
  | KeyPropertyValue
  | StringPropertyValue
  | BlobValue
  | GeoPointValue
  | ArrayValue
  | EntityValue
);

export type Entity = {
  key: Key;
  properties?: Record<string, PropertyValue>;
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

export function useProject() {
  const { project } = React.useContext(APIContext)!;
  return project;
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

function partitionID(namespace: string | null) {
  return namespace == null ? {} : { partitionId: { namespaceId: namespace } };
}

////////////////////////////////////////////////////////////////////////////////////////////
// React-Query wrappers
////////////////////////////////////////////////////////////////////////////////////////////

export function useNamespaces() {
  const { project } = React.useContext(APIContext)!;
  return useQuery<(string | null)[], Error>("namespaces", async () => {
    const r = await runQuery(project, {
      query: {
        kind: [{ name: "__namespace__" }],
      },
    });
    const namespaces = (r.batch.entityResults || []).map(
      (e: any) => e.entity.key.path[0].name || null,
    );
    if (namespaces.length === 0) {
      namespaces.push(null);
    }
    return namespaces;
  });
}

export function useKinds(namespace: string | null) {
  const { project } = React.useContext(APIContext)!;
  return useQuery<string[], Error>(
    ["namespaces", namespace, "kinds"],
    async () => {
      const r = await runQuery(project, {
        ...partitionID(namespace),
        query: {
          kind: [{ name: "__kind__" }],
        },
      });
      return (r.batch.entityResults || []).map(
        (e: any) => e.entity.key.path[0].name,
      );
    },
  );
}

export enum OrderDirection {
  Ascending = "ASCENDING",
  Descending = "DESCENDING",
}

type Order = {
  property: string;
  direction: OrderDirection;
};

export function useEntities(
  kind: string | null,
  order: Order | null,
  namespace: string | null,
  pageSize: number,
  page?: number,
) {
  const { project } = React.useContext(APIContext)!;
  return useQuery<Entity[], Error>(
    [
      "namespaces",
      namespace,
      "kinds",
      kind,
      "entities",
      [{ page, pageSize, order }],
    ],
    async () => {
      const result: Entity[] = [];
      let offset = (page ?? 0) * pageSize;
      let limit = pageSize;
      let startCursor = null;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const r: any = await runQuery(project, {
          ...partitionID(namespace),
          query: {
            kind: [{ name: kind }],
            limit,
            offset,
            ...(order == null
              ? {}
              : {
                  order: [
                    {
                      property: {
                        name: order.property,
                      },
                      direction: order.direction,
                    },
                  ],
                }),
            ...(startCursor != null ? { startCursor } : {}),
          },
        });
        const batchResults = r.batch.entityResults || [];
        result.push(...batchResults.map((e: any) => e.entity));
        if (r.batch.moreResults !== "NOT_FINISHED") {
          break;
        }
        offset = offset - r.batch.skippedResults;
        limit = limit - batchResults.length;
        startCursor = r.batch.endCursor;
      }
      return result;
    },
    { keepPreviousData: true, staleTime: 3600 * 1000, enabled: kind != null },
  );
}

export function useGQLQuery(query: string, namespace: string | null) {
  const { project } = React.useContext(APIContext)!;
  return useQuery<Entity[], Error>(
    ["namespaces", namespace, "queries", query],
    async () => {
      const r = await runQuery(project, {
        ...partitionID(namespace),
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
    if ((r.found || []).length === 0) {
      throw { message: "entity not found" };
    }
    return r.found[0].entity;
  });
}

export function useUpdateEntity() {
  const queryClient = useQueryClient();
  const { project } = React.useContext(APIContext)!;
  return useMutation<Entity, Error, { entity: Entity }>(
    async ({ entity }) => {
      const r = await commit(project, {
        mode: "NON_TRANSACTIONAL",
        mutations: [
          {
            update: entity,
          },
        ],
      });
      return {
        ...entity,
        key: r.mutationResults[0].key,
      };
    },
    {
      onSuccess: (data, { entity }) => {
        queryClient.invalidateQueries([
          "namespaces",
          keyNamespace(entity.key),
          "kinds",
          keyKind(entity.key),
          "entities",
        ]);
        queryClient.invalidateQueries(["queries"]);
        queryClient.setQueryData(["entities", entity.key], entity);
      },
    },
  );
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  const { project } = React.useContext(APIContext)!;
  return useMutation<Entity, Error, Entity>(
    async (entity) => {
      const r = await commit(project, {
        mode: "NON_TRANSACTIONAL",
        mutations: [
          {
            insert: entity,
          },
        ],
      });
      return {
        ...entity,
        key: r.mutationResults[0].key ?? entity.key,
      };
    },
    {
      onSuccess: (entity) => {
        queryClient.invalidateQueries([
          "namespaces",
          keyNamespace(entity.key),
          "kinds",
          keyKind(entity.key),
          "entities",
        ]);
        queryClient.invalidateQueries(["queries"]);
        queryClient.invalidateQueries(["namespaces"], { exact: true });
      },
    },
  );
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
            "namespaces",
            keyNamespace(key),
            "kinds",
            keyKind(key),
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

export function keyKind(key: Key) {
  return key.path[key.path.length - 1].kind;
}

export function keyNamespace(key: Key) {
  return key.partitionId.namespaceId || null;
}

export function keyID(key: Key) {
  const p = key.path[key.path.length - 1];
  if (p.name != null) {
    return `"${p.name}"`;
  } else {
    return p.id!;
  }
}
