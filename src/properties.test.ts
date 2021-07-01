import type { PropertyValue } from "./api";
import { valueToEditValue, valueFromEditValue } from "./properties";

const editValueRoundTripTests: PropertyValue[] = [
  {
    stringValue: "test\nstring",
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
];

describe("value(To|From)EditValue", () => {
  for (const t of editValueRoundTripTests) {
    test(`round trips ${JSON.stringify(t)}`, () => {
      expect(
        valueFromEditValue(
          valueToEditValue(t, "project", null),
          "project",
          null,
        ),
      ).toEqual(t);
    });
  }
});
