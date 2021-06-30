import classNames from "classnames";
import React from "react";
import type { PropertyValue } from "./api";
import { keyFromString, keyToString } from "./keys";
import { valueToString, ValueType } from "./properties";
import QuestionCircle from "./ui/icons/question-circle";

export type PropertyEditValue = {
  type: ValueType;
  excludeFromIndexes?: boolean;
  stringValue: string;
  booleanValue: boolean;
  geoPointValue: { latitude: string; longitude: string };
  propertyValue: PropertyValue;
};

const EMPTY_VALUE: PropertyEditValue = Object.freeze({
  type: ValueType.String,
  stringValue: "",
  booleanValue: false,
  geoPointValue: Object.freeze({ latitude: "", longitude: "" }),
  propertyValue: Object.freeze({ nullValue: null }),
});

function parseTime(v: string) {
  try {
    return new Date(v).toISOString();
  } catch (e) {
    throw new Error("Invalid timestamp");
  }
}

function parseDouble(v: string) {
  const n = new Number(v).valueOf();
  if (isNaN(n)) {
    throw new Error("Invalid number");
  }
  return n;
}

function parseInteger(v: string) {
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
    default:
      return valueToString(value.propertyValue, project, namespace);
  }
}

export function newEditValue() {
  return { ...EMPTY_VALUE, type: ValueType.Null };
}

function valueToEditValue(
  v: PropertyValue,
  project: string,
  namespace: string | null,
): PropertyEditValue {
  if ("timestampValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Timestamp,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),
      stringValue: v.timestampValue,
    };
  } else if ("stringValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.String,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      stringValue: v.stringValue,
    };
  } else if ("keyValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Key,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      stringValue: keyToString(v.keyValue, project, namespace),
    };
  } else if ("nullValue" in v) {
    return {
      ...EMPTY_VALUE,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),
      type: ValueType.Null,
    };
  } else if ("booleanValue" in v) {
    return {
      ...EMPTY_VALUE,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      type: ValueType.Boolean,
      booleanValue: v.booleanValue,
    };
  } else if ("integerValue" in v) {
    return {
      ...EMPTY_VALUE,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      type: ValueType.Integer,
      stringValue: v.integerValue,
    };
  } else if ("doubleValue" in v) {
    return {
      ...EMPTY_VALUE,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      type: ValueType.Double,
      stringValue: v.doubleValue + "",
    };
  } else if ("geoPointValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.GeoPoint,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      geoPointValue: {
        latitude: v.geoPointValue.latitude + "",
        longitude: v.geoPointValue.longitude + "",
      },
    };
  } else if ("arrayValue" in v) {
    return {
      ...EMPTY_VALUE,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),

      type: ValueType.Array,
      propertyValue: v,
    };
  } else if ("blobValue" in v) {
    return {
      ...EMPTY_VALUE,
      type: ValueType.Blob,
      ...(v.excludeFromIndexes != null
        ? { excludeFromIndexes: v.excludeFromIndexes }
        : {}),
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
    switch (value.type) {
      case ValueType.Timestamp:
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),

          timestampValue: parseTime(value.stringValue),
        };
      case ValueType.String:
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),

          stringValue: value.stringValue,
        };
      case ValueType.Key:
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),

          keyValue: keyFromString(value.stringValue, project, namespace),
        };
      case ValueType.Integer:
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),

          integerValue: parseInteger(value.stringValue),
        };
      case ValueType.Double: {
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),

          doubleValue: parseDouble(value.stringValue),
        };
      }
      case ValueType.Blob:
        try {
          atob(value.stringValue);
          return {
            ...(value.excludeFromIndexes != null
              ? { excludeFromIndexes: value.excludeFromIndexes }
              : {}),
            blobValue: value.stringValue,
          };
        } catch (e) {
          return null;
        }
      case ValueType.Null:
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),
          nullValue: null,
        };
      case ValueType.Boolean:
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),
          booleanValue: value.booleanValue,
        };
      case ValueType.GeoPoint: {
        return {
          ...(value.excludeFromIndexes != null
            ? { excludeFromIndexes: value.excludeFromIndexes }
            : {}),

          geoPointValue: {
            latitude: parseDouble(value.geoPointValue.latitude),
            longitude: parseDouble(value.geoPointValue.longitude),
          },
        };
      }
      case ValueType.Array:
        return value.propertyValue;
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

function TextValueEdit({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value);
    },
    [onChange],
  );
  return (
    <div>
      <label className="form-label">Value</label>
      <textarea
        className="form-control"
        rows={5}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

function BlobValueEdit({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value);
    },
    [onChange],
  );
  let length: number | null = null;
  try {
    length = atob(value).length;
  } catch (e) {
    //pass
  }
  return (
    <div>
      <label className="form-label">Value</label>
      <textarea
        className={classNames("form-control", length == null && "is-invalid")}
        rows={5}
        value={value}
        onChange={handleChange}
      />
      {length != null ? (
        <div className="form-text">{length} bytes</div>
      ) : (
        <div className="invalid-feedback">Invalid Base64 value</div>
      )}
    </div>
  );
}

function StringValueEdit({
  value,
  onChange,
  parse,
  infoURL,
}: {
  value: string;
  onChange: (value: string) => void;
  parse: (value: string) => any;
  infoURL?: string;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value);
    },
    [onChange],
  );
  let error: string | null = null;
  try {
    parse(value);
  } catch (e) {
    error = e.message;
  }
  return (
    <div>
      <label className="form-label">Value</label>
      <div className="input-group">
        <input
          className={classNames("form-control", error != null && "is-invalid")}
          type="text"
          value={value}
          onChange={handleChange}
        />
        {infoURL != null ? (
          <a
            href={infoURL}
            rel="noreferrer"
            className="input-group-text"
            target="_blank"
          >
            <QuestionCircle className="bi" />
          </a>
        ) : null}
        {error != null ? <div className="invalid-feedback">{error}</div> : null}
      </div>
    </div>
  );
}

function BooleanValueEdit({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value === "true");
    },
    [onChange],
  );
  return (
    <div>
      <label className="form-label">Value</label>
      <select
        className="form-select"
        value={value + ""}
        onChange={handleChange}
      >
        <option value="false">False</option>
        <option value="true">True</option>
      </select>
    </div>
  );
}

function GeoPointValueEdit({
  value,
  onChange,
}: {
  value: { latitude: string; longitude: string };
  onChange: (value: { latitude: string; longitude: string }) => void;
}) {
  const handleChangeLatitude = React.useCallback(
    (ev) => {
      onChange({ ...value, latitude: ev.target.value });
    },
    [onChange, value],
  );
  const handleChangeLongitude = React.useCallback(
    (ev) => {
      onChange({ ...value, longitude: ev.target.value });
    },
    [onChange, value],
  );
  let latitudeError: string | null = null;
  try {
    parseDouble(value.latitude);
  } catch (e) {
    latitudeError = e.message;
  }
  let longitudeError: string | null = null;
  try {
    parseDouble(value.longitude);
  } catch (e) {
    longitudeError = e.message;
  }

  return (
    <>
      <div className="mb-3">
        <label className="form-label">Latitude</label>
        <input
          className={classNames(
            "form-control",
            latitudeError != null && "is-invalid",
          )}
          value={value.latitude}
          onChange={handleChangeLatitude}
        />
        {latitudeError != null ? (
          <div className="invalid-feedback">{latitudeError}</div>
        ) : null}
      </div>
      <div>
        <label className="form-label">Longitude</label>
        <input
          className={classNames(
            "form-control",
            longitudeError != null && "is-invalid",
          )}
          value={value.longitude}
          onChange={handleChangeLongitude}
        />
        {longitudeError != null ? (
          <div className="invalid-feedback">{longitudeError}</div>
        ) : null}
      </div>
    </>
  );
}

export default function PropertyValueEdit({
  value,
  onChange,
  project,
  namespace,
}: {
  value: PropertyEditValue;
  onChange: (value: PropertyEditValue) => void;
  project: string;
  namespace: string | null;
}) {
  const changeType = React.useCallback(
    (ev) => {
      onChange({ ...value, type: parseInt(ev.target.value, 10) });
    },
    [onChange, value],
  );

  const changeStringValue = React.useCallback(
    (v: string) => {
      onChange({ ...value, stringValue: v });
    },
    [onChange, value],
  );

  const changeBooleanValue = React.useCallback(
    (v: boolean) => {
      onChange({ ...value, booleanValue: v });
    },
    [onChange, value],
  );

  const changeGeoPointValue = React.useCallback(
    (v: { latitude: string; longitude: string }) => {
      onChange({ ...value, geoPointValue: v });
    },
    [onChange, value],
  );

  return (
    <form>
      <div className="mb-3">
        <label className="form-label">Type</label>
        <select
          className="form-select"
          value={value.type}
          onChange={changeType}
        >
          <option value={ValueType.Timestamp}>Timestamp</option>
          <option value={ValueType.String}>String</option>
          <option value={ValueType.Key}>Key</option>
          <option value={ValueType.Null}>Null</option>
          <option value={ValueType.Boolean}>Boolean</option>
          <option value={ValueType.Integer}>Integer</option>
          <option value={ValueType.Double}>Double</option>
          <option value={ValueType.GeoPoint}>GeoPoint</option>
          <option value={ValueType.Array}>Array</option>
          <option value={ValueType.Blob}>Blob</option>
          {value.type === ValueType.Entity ? (
            <option disabled={true} value={ValueType.Entity}>
              Entity
            </option>
          ) : null}
        </select>
      </div>
      {(() => {
        switch (value.type) {
          case ValueType.String:
            return (
              <TextValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
              />
            );
          case ValueType.Timestamp:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={parseTime}
              />
            );
          case ValueType.Key:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={(v: string) => keyFromString(v, project, namespace)}
                infoURL="https://support.google.com/cloud/answer/6365503#zippy=%2Ckey-literals"
              />
            );
          case ValueType.Integer:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={parseInteger}
              />
            );
          case ValueType.Double:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={parseDouble}
              />
            );
          case ValueType.Blob:
            return (
              <BlobValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
              />
            );
          case ValueType.Null:
            return null;
          case ValueType.Boolean:
            return (
              <BooleanValueEdit
                value={value.booleanValue}
                onChange={changeBooleanValue}
              />
            );
          case ValueType.GeoPoint:
            return (
              <GeoPointValueEdit
                value={value.geoPointValue}
                onChange={changeGeoPointValue}
              />
            );
          // case ValueType.Array:
          //   return { type, value: [] };
          default:
            return editValueToString(value, project, namespace);
        }
      })()}
    </form>
  );
}
