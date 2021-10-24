import React from "react";
import { Link } from "wouter";
import {
  Entity,
  Key,
  keyID,
  OrderDirection,
  PropertyValue,
  useDeleteEntities,
} from "./api";
import { encodeKey } from "./keys";
import truncate from "lodash/truncate";
import { PropertyValueView } from "./PropertyValueView";
import Table from "./ui/Table";
import PatchQuestion from "./ui/icons/patch-question";
import ChevronDown from "./ui/icons/chevron-compact-down";
import ChevronUp from "./ui/icons/chevron-compact-up";
import sortBy from "lodash/sortBy";

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

export type Sort = {
  property: string | null;
  direction: OrderDirection;
};

function Header({
  children,
  property,
  sort,
  onChangeSort,
}: {
  children: React.ReactNode;
  property: string | null;
  sort: Sort;
  onChangeSort?: (v: Sort) => void;
}) {
  const toggleSort = React.useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        sort.property === property &&
        sort.direction === OrderDirection.Ascending
      ) {
        onChangeSort!({ property, direction: OrderDirection.Descending });
      } else {
        onChangeSort!({ property, direction: OrderDirection.Ascending });
      }
    },
    [onChangeSort, property, sort.direction, sort.property],
  );
  if (onChangeSort == null) {
    return <>{children}</>;
  }
  return (
    <a role="button" onClick={toggleSort}>
      {children}
      {sort.property !== property ? null : (
        <span className="ms-1">
          {sort.direction === OrderDirection.Ascending ? (
            <ChevronUp width={12} height={12} />
          ) : (
            <ChevronDown width={12} height={12} />
          )}
        </span>
      )}
    </a>
  );
}

const defaultSort = { property: null, direction: OrderDirection.Ascending };

function EntitiesTable({
  entities,
  onNext,
  onPrevious,
  haveNext,
  havePrevious,
  namespace,
  page,
  pageSize,
  sort = defaultSort,
  onChangeSort,
  onChangePageSize,
}: {
  entities: Entity[];
  haveNext?: boolean;
  havePrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  sort?: Sort;
  onChangeSort?: (v: Sort) => void;
  namespace: string | null;
  page?: number;
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
          Header: () => (
            <Header property={null} sort={sort} onChangeSort={onChangeSort}>
              ID
            </Header>
          ),
          accessor: "key",
          Cell: ({ value }: { value: Key }) => (
            <Link href={`/entities/${encodeKey(value)}`}>
              <a>{truncate(keyID(value), { length: 20 })}</a>
            </Link>
          ),
        },
      ].concat(
        sortBy(propertyNames).map(
          (p) =>
            ({
              Header: () => (
                <Header property={p} sort={sort} onChangeSort={onChangeSort}>
                  {p}
                </Header>
              ),
              id: p,
              accessor: ({ properties }: Entity) => (properties ?? {})[p],
              Cell: ({ value }: { value?: PropertyValue }) => {
                return value == null ? (
                  <span className="text-muted">
                    <PatchQuestion title={"Not defined"} height={12} />
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
    [namespace, onChangeSort, propertyNames, sort],
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
      page={page}
      pageSize={pageSize}
    />
  );
}

export default EntitiesTable;
