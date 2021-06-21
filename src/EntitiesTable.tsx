import React from "react";
import { Link } from "wouter";
import {
  encodeKey,
  Entity,
  Key,
  keyToLocalString,
  PropertyValue,
  useDeleteEntities,
} from "./api";
import { PropertyValueView, truncate } from "./properties";
import Table from "./ui/Table";

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
}: {
  entities: Entity[];
  haveNext?: boolean;
  havePrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
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
              <a>{truncate(keyToLocalString(value), 20)}</a>
            </Link>
          ),
        },
      ].concat(
        propertyNames.map(
          (p) =>
            ({
              Header: p,
              id: p,
              accessor: ({ properties }: Entity) => properties[p],
              Cell: ({ value }: { value?: PropertyValue }) => {
                return value == null ? (
                  <span className="text-muted">undefined</span>
                ) : (
                  <PropertyValueView value={value} isShort={true} />
                );
              },
            } as any),
        ),
      ),
    [propertyNames],
  );

  if (entities.length == 0) {
    return <div className="text-muted">No results</div>;
  }

  return (
    <Table
      className="table table-striped"
      wrapperClassName="table-responsive"
      columns={columns}
      data={entities}
      Actions={EntitiesTableActions}
      onNext={onNext}
      onPrevious={onPrevious}
      haveNext={haveNext}
      havePrevious={havePrevious}
    />
  );
}

export default EntitiesTable;
