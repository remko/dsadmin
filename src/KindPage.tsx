import React from "react";
import { useLocation } from "wouter";
import { Entity, useCreateEntity, useEntities, useKinds } from "./api";
import EntitiesTable from "./EntitiesTable";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import { namespacedLocation } from "./locations";
import PlusIcon from "./ui/icons/plus";
import { encodeKey } from "./keys";
import useDocumentTitle from "./ui/useDocumentTitle";
import CreateEntityDialog from "./CreateEntityDialog";
import qs from "querystringify";

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
  pageSize,
}: {
  kind: string;
  namespace: string | null;
  page: number;
  pageSize: number;
}) {
  const [, setLocation] = useLocation();
  const { data, error, isPreviousData } = useEntities(
    kind,
    namespace,
    pageSize,
    page,
  );

  const onPrevious = React.useCallback(() => {
    setLocation(
      `/kinds/${kind}` +
        (page > 1
          ? qs.stringify({ page: page - 1, pageSize }, true)
          : qs.stringify({ pageSize }, true)),
    );
  }, [kind, page, pageSize, setLocation]);
  const onNext = React.useCallback(() => {
    setLocation(
      `/kinds/${kind}` + qs.stringify({ page: page + 1, pageSize }, true),
    );
  }, [kind, page, pageSize, setLocation]);
  const onChangePageSize = React.useCallback(
    (v: number) => {
      setLocation(
        `/kinds/${kind}` + qs.stringify({ page, pageSize: v }, true),
        { replace: true },
      );
    },
    [kind, page, setLocation],
  );

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
        onChangePageSize={onChangePageSize}
        pageSize={pageSize}
        haveNext={data.length >= pageSize}
        namespace={namespace}
        havePrevious={page > 0}
      />
    </>
  );
}

function KindPage({
  kind,
  namespace,
  page,
  pageSize,
}: {
  kind: string;
  namespace: string | null;
  page: number;
  pageSize: number;
}) {
  const [createEntityDialogIsOpen, setCreateEntityDialogIsOpen] =
    React.useState(false);
  const openCreateEntityDialog = React.useCallback(() => {
    setCreateEntityDialogIsOpen(true);
  }, []);
  const closeCreateEntityDialog = React.useCallback(() => {
    setCreateEntityDialogIsOpen(false);
  }, []);

  useDocumentTitle(kind);

  const [, setLocation] = useLocation();

  const {
    mutateAsync: createEntity,
    error,
    reset: resetCreateEntity,
  } = useCreateEntity();

  const addEntity = React.useCallback(
    async (e: Entity) => {
      resetCreateEntity();
      setCreateEntityDialogIsOpen(false);
      const entity = await createEntity(e);
      setLocation(`/entities/${encodeKey(entity.key)}`);
    },
    [createEntity, resetCreateEntity, setLocation],
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <KindSelector value={kind} namespace={namespace} />
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={openCreateEntityDialog}
        >
          <PlusIcon />
        </button>
      </div>
      {error != null ? <ErrorMessage error={error} /> : null}
      <KindTable
        kind={kind}
        namespace={namespace}
        page={page}
        pageSize={pageSize}
      />
      {createEntityDialogIsOpen ? (
        <CreateEntityDialog
          isOpen={true}
          onRequestClose={closeCreateEntityDialog}
          onCreate={addEntity}
          initialKind={kind}
          initialNamespace={namespace}
        />
      ) : null}
    </div>
  );
}

export default KindPage;
