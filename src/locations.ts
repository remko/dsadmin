import { decodeKey, keyNamespace } from "./api";

const namespaceRE = /^\/namespaces\/([^/]+)\/?/;
const entitiesRE = /^\/entities\/([^/]+)\/?/;

export function namespaceForLocation(location: string) {
  const nm = location.match(namespaceRE);
  if (nm) {
    return nm[1];
  }
  const em = location.match(entitiesRE);
  if (em) {
    return keyNamespace(decodeKey(em[1]));
  }

  return null;
}

export function namespacedLocation(location: string, namespace: string | null) {
  return namespace == null ? location : `/namespaces/${namespace}${location}`;
}
