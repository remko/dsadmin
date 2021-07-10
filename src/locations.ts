import { keyNamespace } from "./api";
import { decodeKey } from "./keys";
import qs from "querystringify";

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

export function updateQuery(oq: string, q: Record<string, any>): string {
  const nq = { ...qs.parse(oq), ...q };
  for (const [k, v] of Object.entries(nq)) {
    if (v === undefined) {
      delete nq[k];
    }
  }
  return qs.stringify(nq, true);
}
