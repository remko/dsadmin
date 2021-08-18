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
    return `lat: ${v.geoPointValue.latitude ?? 0}, lon: ${
      v.geoPointValue.longitude ?? 0
    }`;
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
  meaning?: number;
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

export function newEditValue(type = ValueType.Null) {
  return {
    ...EMPTY_VALUE,
    type,
    ...(type === ValueType.Timestamp
      ? { stringValue: new Date().toISOString() }
      : {}),
  };
}

export function valueToEditValue(
  v: PropertyValue,
  project: string,
  namespace: string | null,
): PropertyEditValue {
  const baseValue = {
    ...EMPTY_VALUE,
    ...(v.excludeFromIndexes != null
      ? { excludeFromIndexes: v.excludeFromIndexes }
      : {}),
    ...(v.meaning != null ? { meaning: v.meaning } : {}),
  };
  if ("timestampValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Timestamp,
      stringValue: v.timestampValue,
    };
  } else if ("stringValue" in v) {
    return {
      ...baseValue,
      type: ValueType.String,
      stringValue: v.stringValue,
    };
  } else if ("keyValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Key,
      stringValue: keyToString(v.keyValue, project, namespace),
    };
  } else if ("nullValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Null,
    };
  } else if ("booleanValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Boolean,
      booleanValue: v.booleanValue,
    };
  } else if ("integerValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Integer,
      stringValue: v.integerValue,
    };
  } else if ("doubleValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Double,
      stringValue: v.doubleValue + "",
    };
  } else if ("geoPointValue" in v) {
    return {
      ...baseValue,
      type: ValueType.GeoPoint,
      geoPointValue: {
        latitude: (v.geoPointValue.latitude ?? 0) + "",
        longitude: (v.geoPointValue.longitude ?? 0) + "",
      },
    };
  } else if ("arrayValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Array,
      arrayValue: (v.arrayValue.values || []).map((v) =>
        valueToEditValue(v, project, namespace),
      ),
    };
  } else if ("blobValue" in v) {
    return {
      ...baseValue,
      type: ValueType.Blob,
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
    const baseValue = {
      ...(value.excludeFromIndexes != null
        ? { excludeFromIndexes: value.excludeFromIndexes }
        : {}),
      ...(value.meaning != null ? { meaning: value.meaning } : {}),
    };
    switch (value.type) {
      case ValueType.Timestamp:
        try {
          parseTime(value.stringValue);
        } catch (e) {
          return null;
        }
        return {
          ...baseValue,
          timestampValue: value.stringValue,
        };
      case ValueType.String:
        return {
          ...baseValue,
          stringValue: value.stringValue,
        };
      case ValueType.Key:
        return {
          ...baseValue,
          keyValue: keyFromString(value.stringValue, project, namespace),
        };
      case ValueType.Integer:
        return {
          ...baseValue,
          integerValue: parseInteger(value.stringValue),
        };
      case ValueType.Double: {
        return {
          ...baseValue,
          doubleValue: parseDouble(value.stringValue),
        };
      }
      case ValueType.Blob:
        try {
          b64decode(value.stringValue);
          return {
            ...baseValue,
            blobValue: value.stringValue,
          };
        } catch (e) {
          return null;
        }
      case ValueType.Null:
        return {
          ...baseValue,
          nullValue: null,
        };
      case ValueType.Boolean:
        return {
          ...baseValue,
          booleanValue: value.booleanValue,
        };
      case ValueType.GeoPoint: {
        const latitude = parseDouble(value.geoPointValue.latitude);
        const longitude = parseDouble(value.geoPointValue.longitude);
        return {
          ...baseValue,
          geoPointValue: {
            ...(latitude === 0 ? {} : { latitude }),
            ...(longitude === 0 ? {} : { longitude }),
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
          ...baseValue,
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
