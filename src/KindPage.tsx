import React from "react";
import { useLocation } from "wouter";
import { useEntities, useKinds } from "./api";
import EntitiesTable from "./EntitiesTable";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import { namespacedLocation } from "./locations";

const pageSize = 25;

function KindSelector({
  value,
  namespace,
}: {
  value: string;
  namespace: string | null;
}) {
  const { data: kinds, error } = useKinds(namespace);
  const [, setLocation] = useLocation();

  const onLocationChange = React.useCallback(
    (ev) => {
      setLocation(namespacedLocation(`/kinds/${ev.target.value}`, namespace));
    },
    [namespace, setLocation],
  );

  if (kinds == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }
  return (
    <div className="row g-3">
      <div className="col-auto">
        <label className="col-form-label">Kind</label>
      </div>
      <div className="col-auto">
        <select
          className="col-auto form-select mb-3"
          value={value}
          onChange={onLocationChange}
        >
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function KindTable({
  kind,
  namespace,
  page,
}: {
  kind: string;
  namespace: string | null;
  page: number;
}) {
  const [, setLocation] = useLocation();
  const { data, error, isPreviousData } = useEntities(
    kind,
    namespace,
    pageSize,
    page,
  );

  const onPrevious = React.useCallback(() => {
    setLocation(`/kinds/${kind}/${page - 1}`);
  }, [kind, page, setLocation]);
  const onNext = React.useCallback(() => {
    setLocation(`/kinds/${kind}/${page + 1}`);
  }, [kind, page, setLocation]);

  if (data == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }

  return (
    <>
      {isPreviousData ? (
        <div className="position-absolute bottom-50 end-50">
          <Loading />
        </div>
      ) : null}
      <EntitiesTable
        entities={data}
        onNext={onNext}
        onPrevious={onPrevious}
        haveNext={data.length >= pageSize}
        havePrevious={page > 0}
      />
    </>
  );
}

function KindPage({
  kind,
  namespace,
  page,
}: {
  kind: string;
  namespace: string | null;
  page: number;
}) {
  return (
    <div>
      <KindSelector value={kind} namespace={namespace} />
      <KindTable kind={kind} namespace={namespace} page={page} />
    </div>
  );
}

export default KindPage;
