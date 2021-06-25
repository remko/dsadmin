import React from "react";
import { useLocation } from "wouter";
import { useNamespaces } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";

export default function NamespaceSelector({
  namespace,
}: {
  namespace: string | null;
}) {
  const { data: namespaces, error } = useNamespaces();
  const [, setLocation] = useLocation();

  const onLocationChange = React.useCallback(
    (ev) => {
      setLocation(
        ev.target.value == "~null~" ? `/` : `/namespaces/${ev.target.value}`,
      );
    },
    [setLocation],
  );

  if (namespaces == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }
  return (
    <select
      className="form-select"
      value={namespace || "~null~"}
      onChange={onLocationChange}
    >
      {namespaces.map((k) => (
        <option key={k || "~null~"} value={k || "~null~"}>
          {k || "(Default namespace)"}
        </option>
      ))}
    </select>
  );
}
