#!/usr/bin/env node

import axios from "axios";

const projectID = "dsadmin-dev";

async function call(action, body) {
  try {
    await axios.post(
      `http://localhost:7080/v1/projects/dsadmin-dev:${action}`,
      body,
    );
  } catch (e) {
    console.log(e.message, e.response.data);
  }
}

// ID model with properties
await call("commit", {
  mode: "NON_TRANSACTIONAL",
  mutations: [
    {
      insert: {
        key: {
          partitionId: {
            projectId: projectID,
          },
          path: [{ kind: "Kind", id: null }],
        },
        properties: {
          nullProp: {
            nullValue: null,
          },
          booleanProp: {
            booleanValue: true,
          },
          integerProp: {
            integerValue: 42,
          },
          doubleProp: {
            doubleValue: 4.2,
          },
          timestampProp: {
            timestampValue: "2021-06-25T15:18:44.880Z",
          },
          keyProp: {
            keyValue: {
              partitionId: {
                projectId: projectID,
              },
              path: [{ kind: "MyKind", name: "Entity" }],
            },
          },
          stringProp: {
            stringValue: "My String",
          },
          blobProp: {
            blobValue: "SGVsbG8K",
          },
          geoPointProp: {
            geoPointValue: {
              latitude: 50.8798,
              longitude: 4.7005,
            },
          },
          // // TODO
          // // entityValue: {}
          arrayProp: {
            arrayValue: {
              values: [
                {
                  stringValue: "Value 1",
                },
                { stringValue: "Value 2" },
                { integerValue: 42 },
              ],
            },
          },
        },
      },
    },
  ],
});

// Named model with properties
await call("commit", {
  mode: "NON_TRANSACTIONAL",
  mutations: [
    {
      insert: {
        key: {
          partitionId: {
            projectId: projectID,
          },
          path: [{ kind: "Kind", name: "Entity" }],
        },
        properties: {
          nullProp: {
            nullValue: null,
          },
          booleanProp: {
            booleanValue: false,
          },
          integerProp: {
            integerValue: 23,
          },
          doubleProp: {
            doubleValue: 1.234566789,
          },
          timestampProp: {
            timestampValue: "1980-08-05T23:18:44.880Z",
          },
          keyProp: {
            keyValue: {
              partitionId: {
                projectId: projectID,
              },
              path: [{ kind: "MyKind", id: 1 }],
            },
          },
          stringProp: {
            stringValue: "My Other String",
          },
          blobProp: {
            blobValue: "AAEK",
          },
          geoPointProp: {
            geoPointValue: {
              latitude: 23.8798,
              longitude: 2.7005,
            },
          },
          // // TODO
          // // entityValue: {}
          arrayProp: {
            arrayValue: {
              values: [
                {
                  stringValue: "Value 3",
                },
                { integerValue: 23 },
              ],
            },
          },
        },
      },
    },
  ],
});

await call("commit", {
  mode: "NON_TRANSACTIONAL",
  mutations: [
    {
      insert: {
        key: {
          partitionId: {
            projectId: projectID,
          },
          path: [{ kind: "Kind", name: "EntityWithSingleProperty" }],
        },
        properties: {
          integerProp: {
            integerValue: 14,
          },
        },
      },
    },
  ],
});

await call("commit", {
  mode: "NON_TRANSACTIONAL",
  mutations: [
    {
      insert: {
        key: {
          partitionId: {
            projectId: projectID,
            namespaceId: "myNamespace",
          },
          path: [{ kind: "KindInNamespace", name: "EntityWithSingleProperty" }],
        },
        properties: {
          integerProp: {
            integerValue: 14,
          },
        },
      },
    },
  ],
});

await call("commit", {
  mode: "NON_TRANSACTIONAL",
  mutations: [
    {
      insert: {
        key: {
          partitionId: {
            projectId: projectID,
            namespaceId: "myNamespace",
          },
          path: [{ kind: "Kind", name: "EntityInNamespace" }],
        },
        properties: {
          integerProp: {
            integerValue: 32,
          },
        },
      },
    },
  ],
});

for (let i = 0; i < 1000; i++) {
  await call("commit", {
    mode: "NON_TRANSACTIONAL",
    mutations: [
      {
        insert: {
          key: {
            partitionId: {
              projectId: projectID,
            },
            path: [{ kind: "KindWithManyEntities" }],
          },
          properties: {
            integerProp: {
              integerValue: i,
            },
            stringProp: {
              stringValue: `Entity ${i}`,
            },
          },
        },
      },
    ],
  });
}
