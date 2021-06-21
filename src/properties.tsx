import classNames from "classnames";
import React from "react";
import { Link } from "wouter";
import { encodeKey, keyToString, PropertyValue } from "./api";

export function truncate(str: string, n: number) {
  return str.length > n ? (
    <React.Fragment>{str.substr(0, n - 1)}&hellip;</React.Fragment>
  ) : (
    <React.Fragment>{str}</React.Fragment>
  );
}

export function PropertyValueView({
  value: v,
  isShort,
}: {
  value: PropertyValue;
  isShort?: boolean;
}) {
  if ("timestampValue" in v) {
    return (
      <span className={classNames(isShort && "text-nowrap")}>
        {new Date(v.timestampValue).toLocaleString()}
      </span>
    );
  } else if ("stringValue" in v) {
    return (
      <span className={classNames(isShort && "text-nowrap")}>
        {isShort ? truncate(v.stringValue, 20) : v.stringValue}
      </span>
    );
  } else if ("keyValue" in v) {
    return (
      <Link
        className={classNames(isShort && "text-nowrap")}
        href={`/entities/${encodeKey(v.keyValue)}`}
      >
        {isShort
          ? truncate(keyToString(v.keyValue), 20)
          : keyToString(v.keyValue)}
      </Link>
    );
  } else if ("nullValue" in v) {
    return <span className="text-muted">null</span>;
  } else if ("booleanValue" in v) {
    return (
      <input
        type="checkbox"
        checked={v.booleanValue}
        disabled={true}
        readOnly={true}
      />
    );
  } else if ("integerValue" in v) {
    return <React.Fragment>{v.integerValue}</React.Fragment>;
  } else if ("arrayValue" in v) {
    return (
      <React.Fragment>
        [
        {(v.arrayValue.values || []).map((v, i) => (
          <React.Fragment key={i}>
            {i === 0 ? null : ", "}
            <PropertyValueView value={v} isShort={isShort} />
          </React.Fragment>
        ))}
        ]
      </React.Fragment>
    );
  } else if ("blobValue" in v) {
    return (
      <span className={classNames("text-muted", isShort && "text-nowrap")}>
        blob ({atob(v.blobValue).length} bytes)
      </span>
    );
  }
  return <React.Fragment>{JSON.stringify(v)}</React.Fragment>;
}
