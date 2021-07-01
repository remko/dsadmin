import type { PropertyValue } from "./api";
import { keyToString } from "./keys";
import isEqual from "lodash/isEqual";

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
    const blob = atob(v.blobValue);
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
