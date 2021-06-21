import React from "react";
import { useLocation } from "wouter";
import { useEntities, useKinds } from "./api";
import EntitiesTable from "./EntitiesTable";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";

const pageSize = 25;

function KindSelector({ value }: { value: string }) {
  const { data: kinds, error } = useKinds();
  const [, setLocation] = useLocation();

  const onLocationChange = React.useCallback(
    (ev) => {
      setLocation(`/kinds/${ev.target.value}`);
    },
    [setLocation],
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

function KindTable({ kind, page }: { kind: string; page: number }) {
  const [, setLocation] = useLocation();
  const { data, error, isPreviousData } = useEntities(kind, pageSize, page);

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

function KindPage({ kind, page }: { kind: string; page: number }) {
  return (
    <div>
      <KindSelector value={kind} />
      <KindTable kind={kind} page={page} />
    </div>
  );
}

export default KindPage;
