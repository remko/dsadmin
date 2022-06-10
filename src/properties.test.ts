import { expect } from "chai";
import type { PropertyValue } from "./api";
import { valueToEditValue, valueFromEditValue } from "./properties";

const editValueRoundTripTests: PropertyValue[] = [
  {
    stringValue: "it\nstring",
  },
  {
    arrayValue: {},
  },
  {
    arrayValue: {
      values: [
        {
          stringValue: "Value 1",
        },
        { stringValue: "Value 2" },
        { integerValue: "42" },
      ],
    },
  },
  {
    timestampValue: "2021-02-16T18:33:09.3145734Z",
  },
  {
    timestampValue: "2021-02-16T18:33:09.31Z",
  },
  {
    blobValue: "SGVsbG8K",
  },
  {
    geoPointValue: {
      latitude: 50.8798,
      longitude: 4.7005,
    },
  },
  {
    geoPointValue: {
      longitude: 4.7005,
    },
  },
  {
    geoPointValue: {
      latitude: 4.7005,
    },
  },
  {
    geoPointValue: {},
  },
  {
    nullValue: null,
  },
  {
    booleanValue: true,
  },
  {
    integerValue: "42",
  },
  {
    doubleValue: 4.2,
  },
  {
    keyValue: {
      partitionId: {
        projectId: "project",
      },
      path: [{ kind: "Kind", name: "Entity" }],
    },
  },
  {
    entityValue: {
      key: {
        partitionId: { projectId: "project" },
        path: [{ kind: "SubInitKind", name: "m2" }],
      },
      properties: {
        foo: { stringValue: "bar" },
        baz: { integerValue: "3" },
      },
    },
  },
];

describe("value(To|From)EditValue", () => {
  for (const t of editValueRoundTripTests) {
    it(`round trips ${JSON.stringify(t)}`, () => {
      expect(
        valueFromEditValue(
          valueToEditValue(t, "project", null),
          "project",
          null,
        ),
      ).to.deep.equal(t);
    });
  }
});
