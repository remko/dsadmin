import React from "react";
import { useLocation } from "wouter";
import {
  Entity,
  OrderDirection,
  useCreateEntity,
  useEntities,
  useKinds,
} from "./api";
import EntitiesTable, { Sort } from "./EntitiesTable";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import { namespacedLocation, updateQuery } from "./locations";
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
      setLocation(
        namespacedLocation(
          `/kinds/${encodeURIComponent(ev.target.value)}`,
          namespace,
        ),
      );
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

type KindQuery = {
  page?: string;
  sort?: string;
  sortDirection?: string;
};

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

  const q = qs.parse(window.location.search) as KindQuery;
  const sort: Sort = {
    property: q.sort ?? null,
    direction:
      q.sortDirection == "desc"
        ? OrderDirection.Descending
        : OrderDirection.Ascending,
  };

  const { data, error, isPreviousData } = useEntities(
    kind,
    sort.property == null && sort.direction === OrderDirection.Ascending
      ? null
      : {
          property: sort.property ?? "__key__",
          direction: sort.direction,
        },
    namespace,
    pageSize,
    page,
  );

  const setSort = React.useCallback(
    (sort: Sort) => {
      const nq = {
        ...q,
        sortDirection:
          sort.direction == OrderDirection.Descending ? "desc" : "asc",
      };
      delete nq.page;
      if (sort.property == null) {
        delete nq.sort;
      } else {
        nq.sort = sort.property;
      }
      setLocation(
        namespacedLocation(
          `/kinds/${encodeURIComponent(kind)}` + qs.stringify(nq, true),
          namespace,
        ),
      );
    },
    [kind, namespace, q, setLocation],
  );

  const onPrevious = React.useCallback(() => {
    setLocation(
      namespacedLocation(
        `/kinds/${encodeURIComponent(kind)}` +
          updateQuery(window.location.search, {
            page: page > 1 ? page - 1 : undefined,
          }),
        namespace,
      ),
    );
  }, [kind, namespace, page, setLocation]);

  const onNext = React.useCallback(() => {
    setLocation(
      namespacedLocation(
        `/kinds/${encodeURIComponent(kind)}` +
          updateQuery(window.location.search, { page: page + 1 }),
        namespace,
      ),
    );
  }, [kind, namespace, page, setLocation]);

  const onChangePageSize = React.useCallback(
    (v: number) => {
      setLocation(
        namespacedLocation(
          `/kinds/${encodeURIComponent(kind)}` +
            updateQuery(window.location.search, { pageSize: v }),
          namespace,
        ),
        {
          replace: true,
        },
      );
    },
    [kind, namespace, setLocation],
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
        sort={sort}
        onChangeSort={setSort}
        entities={data}
        onNext={onNext}
        onPrevious={onPrevious}
        onChangePageSize={onChangePageSize}
        pageSize={pageSize}
        page={page}
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
