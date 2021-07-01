import React from "react";
import classNames from "classnames";

export default function Select({
  value,
  onChange,
  placeholder,
  values,
}: {
  value: string;
  values: Array<{ label: string; value: string } | string>;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setOpen] = React.useState(false);

  const toggle = React.useCallback((ev) => {
    ev.preventDefault();
    setOpen((v) => !v);
  }, []);

  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
      />
      <button
        className={classNames(
          "btn btn-outline-secondary dropdown-toggle",
          isOpen && "show",
        )}
        type="button"
        onClick={toggle}
      ></button>
      <ul
        style={{ top: "30px", right: 0 }}
        className={classNames(
          "dropdown-menu dropdown-menu-end",
          isOpen && "show",
        )}
      >
        {values.map((v) => {
          let label: string, value: string;
          if (typeof v === "object") {
            label = v.label;
            value = v.value;
          } else {
            label = value = v;
          }
          return (
            <li key={value}>
              <a
                className="dropdown-item"
                role="button"
                onClick={(ev) => {
                  ev.preventDefault();
                  setOpen(false);
                  onChange(value);
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
