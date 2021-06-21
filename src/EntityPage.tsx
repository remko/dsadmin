import React from "react";
import { Link } from "wouter";
import { useEntity, decodeKey, keyToString } from "./api";
import { PropertyValueView, truncate } from "./properties";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";

export default function EntityPage({
  entityKey: encodedKey,
}: {
  entityKey: string;
}) {
  const key = decodeKey(encodedKey);
  const { data, error } = useEntity(key);

  if (data == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }
  const lkey = key.path[key.path.length - 1];

  return (
    <div>
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href={`/kinds/${lkey.kind}`}>{lkey.kind}</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {truncate(keyToString(data.key), 80)}
        </li>
      </ol>
      <h1>Entity</h1>
      <form>
        {lkey.name != null ? (
          <div className="mb-3">
            <label className="form-label">Key Name</label>
            <div className="form-control-plaintext">{lkey.name}</div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Key ID</label>
            <div className="form-control-plaintext">{lkey.id}</div>
          </div>
        )}
        {Object.entries(data.properties).map(([name, value]) => {
          return (
            <div key={name} className="mb-3">
              <label className="form-label">{name}</label>
              <div className="form-control-plaintext">
                <PropertyValueView value={value} />
              </div>
            </div>
          );
        })}
      </form>
    </div>
  );
}
