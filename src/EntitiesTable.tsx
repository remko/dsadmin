import React from "react";
import { Link } from "wouter";
import { Entity, Key, keyID, PropertyValue, useDeleteEntities } from "./api";
import { encodeKey } from "./keys";
import truncate from "lodash/truncate";
import { PropertyValueView } from "./PropertyValueView";
import Table from "./ui/Table";
import PatchQuestion from "./ui/icons/patch-question";

function EntitiesTableActions({ selectedRows }: { selectedRows: any }) {
  const { mutateAsync: deleteEntities, isLoading: isDeleting } =
    useDeleteEntities();
  const onConfirmDelete = React.useCallback(() => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedRows.length} entities?`,
      )
    ) {
      return;
    }
    deleteEntities({
      keys: selectedRows.map(
        ({ original }: { original: Entity }) => original.key,
      ),
    });
  }, [deleteEntities, selectedRows]);
  return (
    <>
      <button
        className="btn btn-outline-danger"
        disabled={selectedRows.length === 0 || isDeleting}
        onClick={onConfirmDelete}
      >
        Delete
      </button>
    </>
  );
}

function EntitiesTable({
  entities,
  onNext,
  onPrevious,
  haveNext,
  havePrevious,
  namespace,
  pageSize,
  onChangePageSize,
}: {
  entities: Entity[];
  haveNext?: boolean;
  havePrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  namespace: string | null;
  pageSize?: number;
  onChangePageSize?: (v: number) => void;
}) {
  const propertyNames = React.useMemo(
    () =>
      entities == null
        ? []
        : Object.keys(
            entities.reduce((acc, { properties }) => {
              return { ...acc, ...properties };
            }, {}),
          ),
    [entities],
  );

  const columns = React.useMemo(
    () =>
      [
        {
          Header: "ID",
          accessor: "key",
          Cell: ({ value }: { value: Key }) => (
            <Link href={`/entities/${encodeKey(value)}`}>
              <a>{truncate(keyID(value), { length: 20 })}</a>
            </Link>
          ),
        },
      ].concat(
        propertyNames.map(
          (p) =>
            ({
              Header: p,
              id: p,
              accessor: ({ properties }: Entity) => (properties ?? {})[p],
              Cell: ({ value }: { value?: PropertyValue }) => {
                return value == null ? (
                  <span className="text-muted">
                    <PatchQuestion height={12} />
                  </span>
                ) : (
                  <PropertyValueView
                    value={value}
                    isShort={true}
                    namespace={namespace}
                  />
                );
              },
            } as any),
        ),
      ),
    [namespace, propertyNames],
  );

  return (
    <Table
      className="table table-sm table-striped"
      wrapperClassName="table-responsive"
      columns={columns}
      data={entities}
      Actions={EntitiesTableActions}
      onNext={onNext}
      onPrevious={onPrevious}
      haveNext={haveNext}
      havePrevious={havePrevious}
      onChangePageSize={onChangePageSize}
      pageSize={pageSize}
    />
  );
}

export default EntitiesTable;
