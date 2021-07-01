import type { PropertyValue } from "./api";
import { keyFromString, keyToString } from "./keys";
import isEqual from "lodash/isEqual";
import { b64decode } from "./ui/b64";

export enum ValueType {
  Null,
  Timestamp,
  String,
  Key,
  Boolean,
  Integer,
  Double,
  GeoPoint,
  Array,
  Blob,
  Entity,
}

// eslint-disable-next-line no-control-regex
const printableRE = /^[\r\n\t\x20-\x7F]*$/;

export function isPrintable(blob: string): boolean {
  return !!blob.match(printableRE);
}

export function valueToString(
  v: PropertyValue,
  project: string,
  namespace: string | null,
): string {
  if ("timestampValue" in v) {
    return v.timestampValue;
  } else if ("stringValue" in v) {
    return v.stringValue;
  } else if ("keyValue" in v) {
    return keyToString(v.keyValue, project, namespace);
  } else if ("nullValue" in v) {
    return "null";
  } else if ("booleanValue" in v) {
    return v.booleanValue + "";
  } else if ("integerValue" in v) {
    return v.integerValue;
  } else if ("doubleValue" in v) {
    return v.doubleValue + "";
  } else if ("geoPointValue" in v) {
    return `lat: ${v.geoPointValue.latitude}, lon: ${v.geoPointValue.longitude}`;
  } else if ("arrayValue" in v) {
    return (
      "[" +
      (v.arrayValue.values || [])
        .map((v) => valueToString(v, project, namespace))
        .join(", ") +
      "]"
    );
  } else if ("blobValue" in v) {
    const blob = b64decode(v.blobValue);
    return isPrintable(blob) ? blob : `blob (${blob.length} bytes)`;
  }
  return JSON.stringify(v);
}

export function isValueEqual(a: PropertyValue, b: PropertyValue): boolean {
  return isEqual(a, b);
}

export function valueType(v: PropertyValue): ValueType {
  if ("timestampValue" in v) {
    return ValueType.Timestamp;
  } else if ("stringValue" in v) {
    return ValueType.String;
  } else if ("keyValue" in v) {
    return ValueType.Key;
  } else if ("nullValue" in v) {
    return ValueType.Null;
  } else if ("booleanValue" in v) {
    return ValueType.Boolean;
  } else if ("integerValue" in v) {
    return ValueType.Integer;
  } else if ("doubleValue" in v) {
    return ValueType.Double;
  } else if ("geoPointValue" in v) {
    return ValueType.GeoPoint;
  } else if ("arrayValue" in v) {
    return ValueType.Array;
  } else if ("blobValue" in v) {
    return ValueType.Blob;
  } else if ("entityValue" in v) {
    return ValueType.Entity;
  }
  throw new Error("Unknown type");
}

export type PropertyEditValue = {
  type: ValueType;
  excludeFromIndexes?: boolean;
  stringValue: string;
  booleanValue: boolean;
  geoPointValue: { latitude: string; longitude: string };
  arrayValue: Array<PropertyEditValue>;
  propertyValue: PropertyValue;
};

const EMPTY_VALUE: PropertyEditValue = Object.freeze({
  type: ValueType.String,
  stringValue: "",
  booleanValue: false,
  geoPointValue: Object.freeze({ latitude: "", longitude: "" }),
  propertyValue: Object.freeze({ nullValue: null }),
  arrayValue: [],
});

export function parseTime(v: string) {
  try {
    return new Date(v).toISOString();
  } catch (e) {
    throw new Error("Invalid timestamp");
  }
}

export function parseDouble(v: string) {
  const n = new Number(v).valueOf();
  if (isNaN(n)) {
    throw new Error("Invalid number");
  }
  return n;
}

export function parseInteger(v: string) {
  if (!v.match(/^([\d]+)$/)) {
    throw new Error("Invalid integer");
  }
  return v;
}

export function editValueToString(
  value: PropertyEditValue,
  project: string,
  namespace: string | null,
): string {
  switch (value.type) {
    case ValueType.Timestamp:
    case ValueType.String:
    case ValueType.Integer:
    case ValueType.Double:
    case ValueType.Blob:
    case ValueType.Key:
      return value.stringValue;
    case ValueType.Null:
      return "null";
    case ValueType.Boolean:
      return value.booleanValue + "";
    case ValueType.GeoPoint:
      return `lat: ${value.geoPointValue.latitude}, lon: ${value.geoPointValue.longitude}`;
    case ValueType.Array:
      return (
        "[" +
        value.arrayValue
          .map((v) => editValueToString(v, project, namespace))
          .join(", ") +
        "]"
      );
    default:
      return valueToString(value.propertyValue, project, namespace);
  }
}

export function newEditValue() {
  return { ...EMPTY_VALUE, type: ValueType.Null };
}

export function valueToEditValue(
  v: PropertyValue,
  project: string,
  namespace: string | null,
): PropertyEditValue {
  const excludeFromIndexes =
    v.excludeFromIndexes != null
      ? { excludeFromIndexes: v.excludeFromIndexes }
      : {};
  if ("timestampValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Timestamp,
      ...excludeFromIndexes,
      stringValue: v.timestampValue,
    };
  } else if ("stringValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.String,
      ...excludeFromIndexes,
      stringValue: v.stringValue,
    };
  } else if ("keyValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Key,
      ...excludeFromIndexes,
      stringValue: keyToString(v.keyValue, project, namespace),
    };
  } else if ("nullValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Null,
      ...excludeFromIndexes,
    };
  } else if ("booleanValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Boolean,
      ...excludeFromIndexes,
      booleanValue: v.booleanValue,
    };
  } else if ("integerValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Integer,
      ...excludeFromIndexes,
      stringValue: v.integerValue,
    };
  } else if ("doubleValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Double,
      ...excludeFromIndexes,
      stringValue: v.doubleValue + "",
    };
  } else if ("geoPointValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.GeoPoint,
      ...excludeFromIndexes,
      geoPointValue: {
        latitude: v.geoPointValue.latitude + "",
        longitude: v.geoPointValue.longitude + "",
      },
    };
  } else if ("arrayValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Array,
      ...excludeFromIndexes,
      arrayValue: (v.arrayValue.values || []).map((v) =>
        valueToEditValue(v, project, namespace),
      ),
    };
  } else if ("blobValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Blob,
      ...excludeFromIndexes,
      stringValue: v.blobValue,
    };
  }
  throw Error("unsupported value");
}

export function valueFromEditValue(
  value: PropertyEditValue,
  project: string,
  namespace: string | null,
): PropertyValue | null {
  try {
    const excludeFromIndexes =
      value.excludeFromIndexes != null
        ? { excludeFromIndexes: value.excludeFromIndexes }
        : {};
    switch (value.type) {
      case ValueType.Timestamp:
        try {
          parseTime(value.stringValue);
        } catch (e) {
          return null;
        }
        return {
          ...excludeFromIndexes,
          timestampValue: value.stringValue,
        };
      case ValueType.String:
        return {
          ...excludeFromIndexes,
          stringValue: value.stringValue,
        };
      case ValueType.Key:
        return {
          ...excludeFromIndexes,
          keyValue: keyFromString(value.stringValue, project, namespace),
        };
      case ValueType.Integer:
        return {
          ...excludeFromIndexes,
          integerValue: parseInteger(value.stringValue),
        };
      case ValueType.Double: {
        return {
          ...excludeFromIndexes,
          doubleValue: parseDouble(value.stringValue),
        };
      }
      case ValueType.Blob:
        try {
          b64decode(value.stringValue);
          return {
            ...excludeFromIndexes,
            blobValue: value.stringValue,
          };
        } catch (e) {
          return null;
        }
      case ValueType.Null:
        return {
          ...excludeFromIndexes,
          nullValue: null,
        };
      case ValueType.Boolean:
        return {
          ...excludeFromIndexes,
          booleanValue: value.booleanValue,
        };
      case ValueType.GeoPoint: {
        return {
          ...excludeFromIndexes,
          geoPointValue: {
            latitude: parseDouble(value.geoPointValue.latitude),
            longitude: parseDouble(value.geoPointValue.longitude),
          },
        };
      }
      case ValueType.Array: {
        const values = value.arrayValue.map((v) =>
          valueFromEditValue(v, project, namespace),
        );
        if (values.some((v) => v == null)) {
          return null;
        }
        return {
          ...excludeFromIndexes,
          arrayValue:
            values.length === 0
              ? {}
              : {
                  values: values as PropertyValue[],
                },
        };
      }
    }
    throw Error("unsupported");
  } catch (e) {
    return null;
  }
}

export function toEditProperties(
  properties: Record<string, PropertyValue>,
  project: string,
  namespace: string | null,
): Record<string, PropertyEditValue> {
  const result: Record<string, PropertyEditValue> = {};
  for (const [name, value] of Object.entries(properties)) {
    result[name] = valueToEditValue(value, project, namespace);
  }
  return result;
}

export function fromEditProperties(
  properties: Record<string, PropertyEditValue | null>,
  project: string,
  namespace: string | null,
): Record<string, PropertyValue> | null {
  const result: Record<string, PropertyValue> = {};
  for (const [name, value] of Object.entries(properties)) {
    if (value == null) {
      continue;
    }
    const v = valueFromEditValue(value, project, namespace);
    if (v == null) {
      return null;
    }
    result[name] = v;
  }
  return result;
}
