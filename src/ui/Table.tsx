import classNames from "classnames";
import React from "react";
import { useTable, useRowSelect, TableInstance } from "react-table";

const TABLE_SIZES = [10, 30, 50, 100, 200];

const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate: boolean }
>(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = ref ?? defaultRef;

  React.useEffect(() => {
    (resolvedRef as any).current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  );
});

export default function Table({
  className,
  columns,
  data,
  Actions,
  onNext,
  onPrevious,
  haveNext,
  havePrevious,
  wrapperClassName,
  page,
  pageSize = 50,
  onChangePageSize,
}: {
  className?: string;
  wrapperClassName?: string;
  columns: any;
  data: any;
  Actions?: any;
  haveNext?: boolean;
  havePrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  page?: number;
  pageSize?: number;
  onChangePageSize?: (v: number) => void;
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    // state: { selectedRowIds },
  } = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: "selection",
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <div>
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }: any) => (
          <div>
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },
      ...columns,
    ]);
  }) as TableInstance<any> & { selectedFlatRows: any; state: any };

  const changePageSize = React.useCallback(
    (ev) => {
      onChangePageSize!(parseInt(ev.target.value, 10));
    },
    [onChangePageSize],
  );
  return (
    <>
      <div className={wrapperClassName}>
        <table className={className} {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              // eslint-disable-next-line react/jsx-key
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
                  <th {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                // eslint-disable-next-line react/jsx-key
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between">
        {Actions != null ? <Actions selectedRows={selectedFlatRows} /> : null}
        <nav className="d-flex align-items-center">
          {onChangePageSize != null ? (
            <div className="row">
              <label className="col-auto gx-2 col-form-label text-muted">
                Rows per page
              </label>
              <div className="col-auto gx-2">
                <select
                  className="form-select text-muted"
                  value={pageSize}
                  onChange={changePageSize}
                >
                  {TABLE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          {page != null ? (
            <div className="text-muted ms-4 me-3">
              {page * pageSize + 1} &#8211; {page * pageSize + data.length}
            </div>
          ) : null}
          <ul className="pagination mb-0">
            {onPrevious != null ? (
              <li
                className={classNames("page-item", !havePrevious && "disabled")}
              >
                <button
                  disabled={!havePrevious}
                  className="page-link"
                  onClick={onPrevious}
                >
                  &laquo;
                </button>
              </li>
            ) : null}
            {onNext != null ? (
              <li className={classNames("page-item", !haveNext && "disabled")}>
                <button
                  disabled={!haveNext}
                  className="page-link"
                  onClick={onNext}
                >
                  &raquo;
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </>
  );
}
