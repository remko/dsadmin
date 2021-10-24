#!/usr/bin/env node

import axios from "axios";
import crypto from "crypto";
import zlib from "zlib";
import { promisify } from "util";

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
          jsonProp: {
            stringValue:
              '{"name":"dsadmin","version":"0.11.2","scripts":{"start":"snowpack dev","build":"snowpack build","format":"prettier --write \\"src/**/*.{js,jsx,ts,tsx}\\"","lint":"prettier --loglevel warn --check \\"src/**/*.{js,jsx,ts,tsx}\\" && tsc --noEmit && eslint .","test":"jest","test-coverage":"jest --coverage","start-emulator":"gcloud --project=dsadmin-dev beta emulators datastore start --host-port=localhost:8081 --data-dir=emulator-data","prepare":"snowpack build"},"repository":"github:remko/dsadmin","dependencies":{"http2-proxy":"^5.0.53","jsesc":"^3.0.2","node-static":"^0.7.11","yargs":"14.2.3"},"devDependencies":{"@babel/core":"^7.14.6","@babel/preset-env":"^7.14.7","@babel/preset-typescript":"^7.14.5","@snowpack/plugin-dotenv":"^2.1.0","@snowpack/plugin-react-refresh":"^2.5.0","@snowpack/plugin-typescript":"^1.2.1","@types/jest":"^26.0.23","@types/lodash":"^4.14.170","@types/querystringify":"^2.0.0","@types/react":"^17.0.4","@types/react-dom":"^17.0.3","@types/react-modal":"^3.12.0","@types/react-table":"^7.7.1","@types/snowpack-env":"^2.3.3","@types/yargs":"^17.0.0","@typescript-eslint/eslint-plugin":"^4.27.0","@typescript-eslint/parser":"^4.27.0","axios":"^0.21.1","babel-jest":"^27.0.5","bootstrap":"^5.0.1","classnames":"^2.3.1","eslint":"^7.29.0","eslint-plugin-prettier":"^3.4.0","eslint-plugin-react":"^7.24.0","eslint-plugin-react-hooks":"^4.2.0","jest":"^27.0.5","lodash":"^4.17.21","path-to-regexp":"^6.2.0","prettier":"^2.2.1","querystringify":"^2.2.0","react":"^17.0.2","react-dom":"^17.0.2","react-modal":"^3.14.3","react-query":"^3.17.2","react-table":"^7.7.0","snowpack":"^3.3.7","typescript":"^4.3.5","wouter":"^2.7.4"},"files":["build","bin/dsadmin.js"],"bin":"./bin/dsadmin.js","license":"MIT","keywords":["google","cloud","datastore","emulator","gui"]}',
            excludeFromIndexes: true,
          },
          jsonBlobProp: {
            blobValue:
              "eyJuYW1lIjoiZHNhZG1pbiIsInZlcnNpb24iOiIwLjExLjIiLCJzY3JpcHRzIjp7InN0YXJ0Ijoic25vd3BhY2sgZGV2IiwiYnVpbGQiOiJzbm93cGFjayBidWlsZCIsImZvcm1hdCI6InByZXR0aWVyIC0td3JpdGUgXCJzcmMvKiovKi57anMsanN4LHRzLHRzeH1cIiIsImxpbnQiOiJwcmV0dGllciAtLWxvZ2xldmVsIHdhcm4gLS1jaGVjayBcInNyYy8qKi8qLntqcyxqc3gsdHMsdHN4fVwiICYmIHRzYyAtLW5vRW1pdCAmJiBlc2xpbnQgLiIsInRlc3QiOiJqZXN0IiwidGVzdC1jb3ZlcmFnZSI6Implc3QgLS1jb3ZlcmFnZSIsInN0YXJ0LWVtdWxhdG9yIjoiZ2Nsb3VkIC0tcHJvamVjdD1kc2FkbWluLWRldiBiZXRhIGVtdWxhdG9ycyBkYXRhc3RvcmUgc3RhcnQgLS1ob3N0LXBvcnQ9bG9jYWxob3N0OjgwODEgLS1kYXRhLWRpcj1lbXVsYXRvci1kYXRhIiwicHJlcGFyZSI6InNub3dwYWNrIGJ1aWxkIn0sInJlcG9zaXRvcnkiOiJnaXRodWI6cmVta28vZHNhZG1pbiIsImRlcGVuZGVuY2llcyI6eyJodHRwMi1wcm94eSI6Il41LjAuNTMiLCJqc2VzYyI6Il4zLjAuMiIsIm5vZGUtc3RhdGljIjoiXjAuNy4xMSIsInlhcmdzIjoiMTQuMi4zIn0sImRldkRlcGVuZGVuY2llcyI6eyJAYmFiZWwvY29yZSI6Il43LjE0LjYiLCJAYmFiZWwvcHJlc2V0LWVudiI6Il43LjE0LjciLCJAYmFiZWwvcHJlc2V0LXR5cGVzY3JpcHQiOiJeNy4xNC41IiwiQHNub3dwYWNrL3BsdWdpbi1kb3RlbnYiOiJeMi4xLjAiLCJAc25vd3BhY2svcGx1Z2luLXJlYWN0LXJlZnJlc2giOiJeMi41LjAiLCJAc25vd3BhY2svcGx1Z2luLXR5cGVzY3JpcHQiOiJeMS4yLjEiLCJAdHlwZXMvamVzdCI6Il4yNi4wLjIzIiwiQHR5cGVzL2xvZGFzaCI6Il40LjE0LjE3MCIsIkB0eXBlcy9xdWVyeXN0cmluZ2lmeSI6Il4yLjAuMCIsIkB0eXBlcy9yZWFjdCI6Il4xNy4wLjQiLCJAdHlwZXMvcmVhY3QtZG9tIjoiXjE3LjAuMyIsIkB0eXBlcy9yZWFjdC1tb2RhbCI6Il4zLjEyLjAiLCJAdHlwZXMvcmVhY3QtdGFibGUiOiJeNy43LjEiLCJAdHlwZXMvc25vd3BhY2stZW52IjoiXjIuMy4zIiwiQHR5cGVzL3lhcmdzIjoiXjE3LjAuMCIsIkB0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luIjoiXjQuMjcuMCIsIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXIiOiJeNC4yNy4wIiwiYXhpb3MiOiJeMC4yMS4xIiwiYmFiZWwtamVzdCI6Il4yNy4wLjUiLCJib290c3RyYXAiOiJeNS4wLjEiLCJjbGFzc25hbWVzIjoiXjIuMy4xIiwiZXNsaW50IjoiXjcuMjkuMCIsImVzbGludC1wbHVnaW4tcHJldHRpZXIiOiJeMy40LjAiLCJlc2xpbnQtcGx1Z2luLXJlYWN0IjoiXjcuMjQuMCIsImVzbGludC1wbHVnaW4tcmVhY3QtaG9va3MiOiJeNC4yLjAiLCJqZXN0IjoiXjI3LjAuNSIsImxvZGFzaCI6Il40LjE3LjIxIiwicGF0aC10by1yZWdleHAiOiJeNi4yLjAiLCJwcmV0dGllciI6Il4yLjIuMSIsInF1ZXJ5c3RyaW5naWZ5IjoiXjIuMi4wIiwicmVhY3QiOiJeMTcuMC4yIiwicmVhY3QtZG9tIjoiXjE3LjAuMiIsInJlYWN0LW1vZGFsIjoiXjMuMTQuMyIsInJlYWN0LXF1ZXJ5IjoiXjMuMTcuMiIsInJlYWN0LXRhYmxlIjoiXjcuNy4wIiwic25vd3BhY2siOiJeMy4zLjciLCJ0eXBlc2NyaXB0IjoiXjQuMy41Iiwid291dGVyIjoiXjIuNy40In0sImZpbGVzIjpbImJ1aWxkIiwiYmluL2RzYWRtaW4uanMiXSwiYmluIjoiLi9iaW4vZHNhZG1pbi5qcyIsImxpY2Vuc2UiOiJNSVQiLCJrZXl3b3JkcyI6WyJnb29nbGUiLCJjbG91ZCIsImRhdGFzdG9yZSIsImVtdWxhdG9yIiwiZ3VpIl19Cg==",
            excludeFromIndexes: true,
          },
          jsonCompressedBlobProp: {
            meaning: 22,
            blobValue:
              "eJx9VU1v2jAYvu9XRD70UBGHBGg6pEo9bIcddtttXSUneRsMTpzZDh+q+t/32o6BAJ2EgDzv834/dt5JyxogS1JpVjW8JROyBaW5bBGb0jSlGUK6VLwzmizfiTZMGbTpVu46Vm6iCrbIKHouqnPYAxPyJlXDrEOnwBgOKorjneIGoheiVZnc3yf39H2tJ2u9nxiNn/3HC0FHwdsLNyFrAVsQ0Y6pFp/LFWCi/4WJ7u4io0vktvJ7w419Bm0jRxRTGNA2xdr++Ke4lNg+q2GAbZaATHzvMTS9YEYqpNSlkH2FpE7JNZTmaZhijEOJCjAsCmQdVcwwjf8gcmHQaSUxYSeVeRKyZMI+Lh+njymaLDmuuHoK/g7BEnAcHVNwPemPCUGT1BzJB1saN6u+WCpoNjI5LbeCDtoK2pKDW+fKmC6z5e+t0+uCTulihry1Bl1aZIaIlUArK4ixcsMdPKU5igPxA1M1RiLpnGZ0ZsvA3r9dZHkuWAEiKaWr/BVd5/QBnQccm9KAg223R2t+ZTWHDrwOj6SFJYU5JJ3oazt6aYZAGU3p9BZFASsNfr9h5JVnLm4zx0nxMFDb87ODk7WXz2v2YGc0OxmErJgPPLdlpvn0ZPvbgzpoo3hb87eDTz6lZwRXnMuWo2F+YcD2mqNxdmlsMLHwW0uzq6CxYYUYFpCfNxK6jo+Dm53HDiv2SU9R3Vxif54S/xP7ufnWs/wzMkpYgxqx2J5L7ZWVpa44t/34OGSb2y68kNLg/FgX9Gq5pWBa25tMh/ot6rP5hrOvLs2ozDhcLn5k8xuM4zYwwqd2PMlyo4d2HOmq6pEkMJYtr2NmFRuJMWrYu3YeBvfzurJBdLeE49ljxWQBGUnlhJ5rZO7W7HEXf8DzM/5INDZdUIvnztxRHZ8TDOua3snehCZylDJeDm9c2B39JuH9UPA2XE90rckfh6ALTS4s9o1QQqttLT9//MLnDRx2UlUuXC3ty8EpAW9ke9GF69auLNzYE1L3nPz5+PIPAhEwVw==",
            excludeFromIndexes: true,
          },
          geoPointProp: {
            geoPointValue: {
              latitude: 50.8798,
              longitude: 4.7005,
            },
          },
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

//////////////////////////////////////////////////////////////////////
// Demo database
//////////////////////////////////////////////////////////////////////

const COMPANIES = ["Acme", "Contoso", "NewCo"];
const COLORS = [
  "black",
  "white",
  "red",
  "green",
  "yellow",
  "blue",
  "pink",
  "gray",
  "brown",
  "orange",
  "purple",
];
const FIRST_NAMES = [
  "Emma",
  "Olivia",
  "Ava",
  "Isabella",
  "Sophia",
  "Charlotte",
  "Mia",
  "Amelia",
  "Harper",
  "Evelyn",
  "Abigail",
  "Emily",
  "Elizabeth",
  "Mila",
  "Ella",
  "Avery",
  "Sofia",
  "Camila",
  "Aria",
  "Scarlett",
  "Victoria",
  "Madison",
  "Luna",
  "Grace",
  "Chloe",
  "Penelope",
  "Layla",
  "Riley",
  "Zoey",
  "Nora",
  "Lily",
  "Eleanor",
  "Liam",
  "Noah",
  "William",
  "James",
  "Oliver",
  "Benjamin",
  "Elijah",
  "Lucas",
  "Mason",
  "Logan",
  "Alexander",
  "Ethan",
  "Jacob",
  "Michael",
  "Daniel",
  "Henry",
  "Jackson",
  "Sebastian",
  "Aiden",
  "Matthew",
  "Samuel",
  "David",
  "Joseph",
  "Carter",
  "Owen",
  "Wyatt",
  "John",
  "Jack",
  "Luke",
  "Jayden",
  "Dylan",
  "Grayson",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
  "Clark",
  "Rodriguez",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "Hernandez",
  "King",
  "Wright",
  "Lopez",
  "Hill",
  "Scott",
  "Green",
  "Adams",
  "Baker",
  "Gonzalez",
  "Nelson",
  "Carter",
  "Mitchell",
  "Perez",
  "Roberts",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
  "Evans",
  "Edwards",
  "Collins",
  "Stewart",
  "Sanchez",
  "Morris",
  "Rogers",
  "Reed",
  "Cook",
  "Morgan",
  "Bell",
  "Murphy",
  "Bailey",
  "Rivera",
  "Cooper",
  "Richardson",
  "Cox",
];

for (let i = 0; i < COMPANIES.length; ++i) {
  const entity = {
    key: {
      partitionId: {
        projectId: projectID,
        namespaceId: "People",
      },
      path: [{ kind: "Company", name: i + "" }],
    },
    properties: {
      name: {
        stringValue: COMPANIES[i],
      },
      established: {
        integerValue: Math.floor(1950 + Math.random() * 50),
      },
    },
  };
  await call("commit", {
    mode: "NON_TRANSACTIONAL",
    mutations: [
      {
        insert: entity,
      },
    ],
  });
}

for (let i = 0; i < 100; i++) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = (
    await promisify(zlib.deflate)(
      `{"firstName":"${firstName}","lastName":"${lastName}"}`,
    )
  ).toString("base64");
  const company = Math.floor(Math.random() * COMPANIES.length);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${COMPANIES[
    company
  ].toLowerCase()}.com`;
  const colors = [];
  const numColors = Math.floor(Math.random() * 5);
  for (let j = 0; j < numColors; j++) {
    colors.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }
  const children = Math.floor(Math.random() * 5);
  const latitude = Math.random() * 180 - 90;
  const longitude = Math.random() * 360 - 180;
  const married = !!Math.floor(Math.random() * 2);
  const birthday = new Date(Math.random() * 1325462400000 - 63162000000);
  const length = Math.random() * 1.7 + 0.5;

  const dnap = [];
  for (let j = 0; j < 100; ++j) {
    dnap.push(["A", "T", "G", "C"][Math.floor(Math.random() * 4)]);
  }
  const dna = (await promisify(zlib.deflate)(dnap.join(""))).toString("base64");

  const entity = {
    key: {
      partitionId: {
        projectId: projectID,
        namespaceId: "People",
      },
      path: [{ kind: "Person", id: null }],
    },
    properties: {
      email: {
        stringValue: email,
      },
      isMarried: {
        booleanValue: married,
      },
      children: {
        integerValue: children,
      },
      length: {
        doubleValue: length,
      },
      birthday: {
        timestampValue: birthday.toISOString(),
      },
      company: {
        keyValue: {
          partitionId: {
            projectId: projectID,
            namespaceId: "People",
          },
          path: [{ kind: "Company", name: company + "" }],
        },
      },
      location: {
        geoPointValue: {
          latitude,
          longitude,
        },
      },
      colors: {
        arrayValue: {
          values: colors.map((color) => ({
            stringValue: color,
          })),
        },
      },

      accessKey: {
        blobValue: crypto.randomBytes(32).toString("base64"),
        excludeFromIndexes: true,
      },

      dna: {
        blobValue: dna,
        excludeFromIndexes: true,
      },

      name: {
        blobValue: name,
        excludeFromIndexes: true,
      },
    },
  };
  await call("commit", {
    mode: "NON_TRANSACTIONAL",
    mutations: [
      {
        insert: entity,
      },
    ],
  });
}
