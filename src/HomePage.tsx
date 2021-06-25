import React from "react";
import { useKinds } from "./api";
import { useLocation } from "wouter";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import { namespacedLocation } from "./locations";

export default function HomePage({ namespace }: { namespace: string | null }) {
  const { data: kinds, error } = useKinds(namespace);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (kinds == null || kinds.length === 0) {
      return;
    }
    setLocation(namespacedLocation(`/kinds/${kinds[0]}`, namespace), {
      replace: true,
    });
  }, [kinds, namespace, setLocation]);

  if (kinds == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }

  if (kinds.length === 0) {
    return (
      <ErrorMessage
        error={"No data found. Did you use the correct project ID?"}
      />
    );
  }
  return null;
}
