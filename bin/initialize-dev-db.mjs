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
              path: [{ kind: "Kind", name: "Entity" }],
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
              path: [{ kind: "Kind", id: 1 }],
            },
          },
          stringProp: {
            stringValue: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dapibus tristique dictum. Fusce non pretium erat. In quis dignissim diam. In ornare varius neque sed pharetra. Vestibulum eleifend turpis suscipit felis consectetur dignissim. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam interdum eu neque in euismod. Etiam viverra odio ut semper scelerisque. Vivamus luctus odio vitae leo hendrerit molestie. Nulla congue est a magna tempor, eget fringilla ante blandit. Cras lacinia quam sit amet augue volutpat, vitae viverra eros lobortis. Fusce mi nibh, sagittis eu pharetra vel, bibendum at augue. Praesent elementum sed ipsum et pharetra. Duis eget lectus tellus. Suspendisse arcu enim, ultrices in ullamcorper condimentum, consectetur ac felis. Aliquam sed arcu non tortor consectetur malesuada.

Nam in ultrices est. Praesent molestie gravida est et aliquet. Nullam tempus magna eu lectus condimentum ultrices. Curabitur eros arcu, volutpat consectetur cursus ac, faucibus eget velit. Phasellus luctus efficitur elit, sed blandit massa dictum non. Quisque vehicula dolor vitae mauris aliquam iaculis. Aliquam tincidunt lobortis tellus quis facilisis. Ut ultrices congue tincidunt. Duis tincidunt, orci ut viverra fringilla, eros tortor consequat velit, nec scelerisque sem purus eu nisi. Proin scelerisque magna lectus, sed blandit ipsum vestibulum a. Nam a pulvinar nunc, eu lacinia nibh. Sed at dui a diam tincidunt rhoncus eget id felis. Praesent id auctor sem.`,
            excludeFromIndexes: true,
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
          },
          path: [{ kind: "Kind", name: "EntityWithExternalKeyLink" }],
        },
        properties: {
          keyProp: {
            keyValue: {
              partitionId: {
                projectId: "other-project",
              },
              path: [{ kind: "Kind", id: 1 }],
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
          path: [{ kind: "Kind", name: "EntityWithNamespaceKeyLink" }],
        },
        properties: {
          keyProp: {
            keyValue: {
              partitionId: {
                projectId: projectID,
                namespaceId: "myNamespace",
              },
              path: [
                { kind: "KindInNamespace", name: "EntityWithSingleProperty" },
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
