#!/usr/bin/env node

import axios from "axios";

const projectID = "dsadmin-dev";

async function call(action, body) {
  try {
    await axios.post(
      `http://localhost:8081/v1/projects/dsadmin-dev:${action}`,
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
            timestampValue: "2021-02-16T18:33:09.3145734Z",
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
            timestampValue: "2021-02-16T18:33:09.3145734Z",
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
            blobValue:
              "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gU2VkIGRhcGlidXMgdHJpc3RpcXVlIGRpY3R1bS4gRnVzY2Ugbm9uIHByZXRpdW0gZXJhdC4gSW4gcXVpcyBkaWduaXNzaW0gZGlhbS4gSW4gb3JuYXJlIHZhcml1cyBuZXF1ZSBzZWQgcGhhcmV0cmEuIFZlc3RpYnVsdW0gZWxlaWZlbmQgdHVycGlzIHN1c2NpcGl0IGZlbGlzIGNvbnNlY3RldHVyIGRpZ25pc3NpbS4gSW50ZXJkdW0gZXQgbWFsZXN1YWRhIGZhbWVzIGFjIGFudGUgaXBzdW0gcHJpbWlzIGluIGZhdWNpYnVzLiBOYW0gaW50ZXJkdW0gZXUgbmVxdWUgaW4gZXVpc21vZC4gRXRpYW0gdml2ZXJyYSBvZGlvIHV0IHNlbXBlciBzY2VsZXJpc3F1ZS4gVml2YW11cyBsdWN0dXMgb2RpbyB2aXRhZSBsZW8gaGVuZHJlcml0IG1vbGVzdGllLiBOdWxsYSBjb25ndWUgZXN0IGEgbWFnbmEgdGVtcG9yLCBlZ2V0IGZyaW5naWxsYSBhbnRlIGJsYW5kaXQuIENyYXMgbGFjaW5pYSBxdWFtIHNpdCBhbWV0IGF1Z3VlIHZvbHV0cGF0LCB2aXRhZSB2aXZlcnJhIGVyb3MgbG9ib3J0aXMuIEZ1c2NlIG1pIG5pYmgsIHNhZ2l0dGlzIGV1IHBoYXJldHJhIHZlbCwgYmliZW5kdW0gYXQgYXVndWUuIFByYWVzZW50IGVsZW1lbnR1bSBzZWQgaXBzdW0gZXQgcGhhcmV0cmEuIER1aXMgZWdldCBsZWN0dXMgdGVsbHVzLiBTdXNwZW5kaXNzZSBhcmN1IGVuaW0sIHVsdHJpY2VzIGluIHVsbGFtY29ycGVyIGNvbmRpbWVudHVtLCBjb25zZWN0ZXR1ciBhYyBmZWxpcy4gQWxpcXVhbSBzZWQgYXJjdSBub24gdG9ydG9yIGNvbnNlY3RldHVyIG1hbGVzdWFkYS4KCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOYW0gaW4gdWx0cmljZXMgZXN0LiBQcmFlc2VudCBtb2xlc3RpZSBncmF2aWRhIGVzdCBldCBhbGlxdWV0LiBOdWxsYW0gdGVtcHVzIG1hZ25hIGV1IGxlY3R1cyBjb25kaW1lbnR1bSB1bHRyaWNlcy4gQ3VyYWJpdHVyIGVyb3MgYXJjdSwgdm9sdXRwYXQgY29uc2VjdGV0dXIgY3Vyc3VzIGFjLCBmYXVjaWJ1cyBlZ2V0IHZlbGl0LiBQaGFzZWxsdXMgbHVjdHVzIGVmZmljaXR1ciBlbGl0LCBzZWQgYmxhbmRpdCBtYXNzYSBkaWN0dW0gbm9uLiBRdWlzcXVlIHZlaGljdWxhIGRvbG9yIHZpdGFlIG1hdXJpcyBhbGlxdWFtIGlhY3VsaXMuIEFsaXF1YW0gdGluY2lkdW50IGxvYm9ydGlzIHRlbGx1cyBxdWlzIGZhY2lsaXNpcy4gVXQgdWx0cmljZXMgY29uZ3VlIHRpbmNpZHVudC4gRHVpcyB0aW5jaWR1bnQsIG9yY2kgdXQgdml2ZXJyYSBmcmluZ2lsbGEsIGVyb3MgdG9ydG9yIGNvbnNlcXVhdCB2ZWxpdCwgbmVjIHNjZWxlcmlzcXVlIHNlbSBwdXJ1cyBldSBuaXNpLiBQcm9pbiBzY2VsZXJpc3F1ZSBtYWduYSBsZWN0dXMsIHNlZCBibGFuZGl0IGlwc3VtIHZlc3RpYnVsdW0gYS4gTmFtIGEgcHVsdmluYXIgbnVuYywgZXUgbGFjaW5pYSBuaWJoLiBTZWQgYXQgZHVpIGEgZGlhbSB0aW5jaWR1bnQgcmhvbmN1cyBlZ2V0IGlkIGZlbGlzLiBQcmFlc2VudCBpZCBhdWN0b3Igc2VtLgo=",
            excludeFromIndexes: true,
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
          path: [{ kind: "Kind", name: "EntityWithUnindexedProperties" }],
        },
        properties: {
          nullProp: {
            nullValue: null,
            excludeFromIndexes: true,
          },
          booleanProp: {
            booleanValue: false,
            excludeFromIndexes: true,
          },
          integerProp: {
            integerValue: 23,
            excludeFromIndexes: true,
          },
          doubleProp: {
            doubleValue: 1.234566789,
            excludeFromIndexes: true,
          },
          timestampProp: {
            timestampValue: "2021-02-16T18:33:09.3145734Z",
            excludeFromIndexes: true,
          },
          keyProp: {
            keyValue: {
              partitionId: {
                projectId: projectID,
              },
              path: [{ kind: "Kind", id: 1 }],
            },
            excludeFromIndexes: true,
          },
          stringProp: {
            stringValue: "Test string",
            excludeFromIndexes: true,
          },
          blobProp: {
            blobValue: "AAEK",
            excludeFromIndexes: true,
          },
          geoPointProp: {
            geoPointValue: {
              latitude: 23.8798,
              longitude: 2.7005,
            },
            excludeFromIndexes: true,
          },
          // // TODO
          // // entityValue: {}
          arrayProp: {
            arrayValue: {
              values: [
                {
                  stringValue: "Value 3",
                  excludeFromIndexes: true,
                },
                { integerValue: 23, excludeFromIndexes: true },
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
          path: [{ kind: "Kind", name: "EntityWithArrayValues" }],
        },
        properties: {
          noArrayProp: {
            arrayValue: {},
          },
          emptyArrayProp: {
            arrayValue: { values: [] },
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
          },
          path: [
            { kind: "Kind", name: "Entity" },
            { kind: "OtherKind", name: "EntityWithParentKey" },
          ],
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
