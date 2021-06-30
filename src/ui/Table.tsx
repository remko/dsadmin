import React from "react";
import { useTable, useRowSelect, TableInstance } from "react-table";

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
        {onNext != null || onPrevious != null ? (
          <div className="btn-group">
            {onPrevious != null ? (
              <button
                disabled={!havePrevious}
                className="btn btn-outline-secondary"
                onClick={onPrevious}
              >
                Previous
              </button>
            ) : null}
            {onNext != null ? (
              <button
                disabled={!haveNext}
                className="btn btn-outline-secondary"
                onClick={onNext}
              >
                Next
              </button>
            ) : null}{" "}
          </div>
        ) : null}
      </div>
    </>
  );
}
