import React from "react";
import { useLocation } from "wouter";
import { useNamespaces, useRememberNamespace } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";

export default function NamespaceSelector({
  namespace,
}: {
  namespace: string | null;
}) {
  const { data: namespaces, error } = useNamespaces();
  const rememberNamespace = useRememberNamespace();
  const [, setLocation] = useLocation();

  const onLocationChange = React.useCallback(
    (ev) => {
      let ns = ev.target.value;
      if (ns == "~other~") {
        ns = prompt("Enter the namespace");
        if (!ns || ns == "") {
          return;
        }
        rememberNamespace(ns);
      }
      setLocation(ns == "~null~" ? `/` : `/namespaces/${ns}/`);
    },
    [setLocation, rememberNamespace],
  );

  if (namespaces == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }
  // The current namespace isn't always listed (e.g. on emulators that don't support
  // listing namespaces)
  const options =
    namespaces.indexOf(namespace) >= 0
      ? namespaces
      : [...namespaces, namespace];
  return (
    <select
      className="form-select"
      value={namespace || "~null~"}
      onChange={onLocationChange}
    >
      {options.map((k) => (
        <option key={k || "~null~"} value={k || "~null~"}>
          {k || "(Default namespace)"}
        </option>
      ))}
      <option value="~other~">Other namespace…</option>
    </select>
  );
}
