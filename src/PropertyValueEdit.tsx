import classNames from "classnames";
import React from "react";
import { encodeKey, keyFromString } from "./keys";
import {
  editValueToString,
  isPrintable,
  newEditValue,
  parseDouble,
  parseInteger,
  parseTime,
  PropertyEditValue,
  valueFromEditValue,
  ValueType,
} from "./properties";
import truncate from "lodash/truncate";
import QuestionCircle from "./ui/icons/question-circle";
import useID from "./ui/useID";
import PlusIcon from "./ui/icons/plus";
import ExclamationCircle from "./ui/icons/exclamation-circle";
import TrashIcon from "./ui/icons/trash";
import LinkIcon from "./ui/icons/link";
import ArrowsAngleContractIcon from "./ui/icons/arrows-angle-contract";
import { Link } from "wouter";
import Modal from "./ui/Modal";
import { inflate } from "pako";
import type { Error } from "./api";

function decompress(raw: string) {
  if (raw.length < 1) {
    return null;
  }
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  try {
    return new TextDecoder().decode(inflate(array));
  } catch (e) {
    return null;
  }
}

function toPrettyValue(v: string | null) {
  if (v == null) {
    return null;
  }
  try {
    const pv = JSON.parse(v);
    return JSON.stringify(pv, null, 2);
  } catch (e) {
    return null;
  }
  return null;
}

function PrettyValueButton({ value }: { value: string }) {
  const [isOpen, setOpen] = React.useState(false);
  const toggleModal = React.useCallback(() => {
    setOpen((v) => !v);
  }, []);
  return (
    <>
      {isOpen ? (
        <Modal
          title={null}
          className="PrettyValueModal"
          onRequestClose={toggleModal}
          isOpen={true}
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleModal}
            >
              Close
            </button>
          }
        >
          <pre>{value}</pre>
        </Modal>
      ) : null}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={toggleModal}
      >
        {"{}"}
      </button>
    </>
  );
}

function TextValueEdit({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value);
    },
    [onChange],
  );

  const prettyValue = toPrettyValue(value);

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label mb-1">Value</label>
        {prettyValue != null ? <PrettyValueButton value={prettyValue} /> : null}
      </div>
      <textarea
        className="form-control"
        rows={5}
        value={value}
        autoFocus={true}
        onChange={handleChange}
      />
    </div>
  );
}

function BlobValueEdit({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value);
    },
    [onChange],
  );
  let blob: string | null = null;
  let prettyValue: string | null = null;
  let decompressedBlob: string | null = null;
  try {
    blob = atob(value);
    decompressedBlob = decompress(blob);
    prettyValue = toPrettyValue(decompressedBlob ?? blob);
  } catch (e) {
    //pass
  }
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label mb-1">Value (Base64)</label>
        <div>
          {decompressedBlob != null ? (
            <ArrowsAngleContractIcon className="me-2" title="Compressed" />
          ) : null}
          {prettyValue != null ? (
            <PrettyValueButton value={prettyValue} />
          ) : null}
        </div>
      </div>
      <textarea
        className={classNames("form-control", length == null && "is-invalid")}
        rows={5}
        value={value}
        onChange={handleChange}
      />
      {blob != null ? (
        <div className="form-text text-truncate">
          {isPrintable(blob) ? `Decoded: "${blob}"` : `${blob.length} bytes`}
        </div>
      ) : (
        <div className="invalid-feedback">Invalid Base64 value</div>
      )}
    </div>
  );
}

function StringValueEdit({
  value,
  onChange,
  parse,
  infoURL,
  linkURL,
  isDisablePretty = false,
}: {
  value: string;
  onChange: (value: string) => void;
  parse: (value: string) => any;
  infoURL?: string;
  linkURL?: string;
  isDisablePretty?: boolean;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value);
    },
    [onChange],
  );
  let error: string | null = null;
  try {
    parse(value);
  } catch (e) {
    error = (e as Error).message;
  }
  const prettyValue = isDisablePretty ? null : toPrettyValue(value);

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label mb-1">
          Value
          {infoURL != null ? (
            <a href={infoURL} rel="noreferrer" target="_blank">
              <QuestionCircle className="bi ms-2" />
            </a>
          ) : null}
        </label>
        {prettyValue != null ? <PrettyValueButton value={prettyValue} /> : null}
      </div>
      <div className="input-group">
        <input
          className={classNames("form-control", error != null && "is-invalid")}
          type="text"
          value={value}
          autoFocus={true}
          onChange={handleChange}
        />
        {linkURL != null ? (
          <Link href={linkURL}>
            <a className="input-group-text">
              <LinkIcon className="bi" />
            </a>
          </Link>
        ) : null}
        {error != null ? <div className="invalid-feedback">{error}</div> : null}
      </div>
    </div>
  );
}

function BooleanValueEdit({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const handleChange = React.useCallback(
    (ev) => {
      onChange(ev.target.value === "true");
    },
    [onChange],
  );
  return (
    <div className="mb-3">
      <label className="form-label">Value</label>
      <select
        className="form-select"
        value={value + ""}
        onChange={handleChange}
      >
        <option value="false">False</option>
        <option value="true">True</option>
      </select>
    </div>
  );
}

function GeoPointValueEdit({
  value,
  onChange,
}: {
  value: { latitude: string; longitude: string };
  onChange: (value: { latitude: string; longitude: string }) => void;
}) {
  const handleChangeLatitude = React.useCallback(
    (ev) => {
      onChange({ ...value, latitude: ev.target.value });
    },
    [onChange, value],
  );
  const handleChangeLongitude = React.useCallback(
    (ev) => {
      onChange({ ...value, longitude: ev.target.value });
    },
    [onChange, value],
  );
  let latitudeError: string | null = null;
  try {
    parseDouble(value.latitude);
  } catch (e) {
    latitudeError = (e as Error).message;
  }
  let longitudeError: string | null = null;
  try {
    parseDouble(value.longitude);
  } catch (e) {
    longitudeError = (e as Error).message;
  }

  return (
    <>
      <div className="mb-3">
        <label className="form-label">Latitude</label>
        <input
          className={classNames(
            "form-control",
            latitudeError != null && "is-invalid",
          )}
          autoFocus={true}
          value={value.latitude}
          onChange={handleChangeLatitude}
        />
        {latitudeError != null ? (
          <div className="invalid-feedback">{latitudeError}</div>
        ) : null}
      </div>
      <div className="mb-3">
        <label className="form-label">Longitude</label>
        <input
          className={classNames(
            "form-control",
            longitudeError != null && "is-invalid",
          )}
          value={value.longitude}
          onChange={handleChangeLongitude}
        />
        {longitudeError != null ? (
          <div className="invalid-feedback">{longitudeError}</div>
        ) : null}
      </div>
    </>
  );
}

function ArrayValueEdit({
  value: values,
  onChange,
  project,
  namespace,
}: {
  value: Array<PropertyEditValue>;
  onChange: (value: Array<PropertyEditValue>) => void;
  project: string;
  namespace: string | null;
}) {
  const [editingProperty, setEditingProperty] = React.useState<number | null>(
    null,
  );
  const add = React.useCallback(
    (ev) => {
      ev.preventDefault();
      if (values.length === 0) {
        onChange([...values, newEditValue()]);
      } else {
        onChange([...values, { ...newEditValue(), type: values[0].type }]);
      }
      setEditingProperty(values.length);
    },
    [onChange, values],
  );
  const editProperty = React.useCallback((i: number, ev) => {
    ev.preventDefault();
    return setEditingProperty((v) => {
      return v === i ? null : i;
    });
  }, []);
  const changeProperty = React.useCallback(
    (i: number, v: PropertyEditValue) => {
      onChange([...values.slice(0, i), v, ...values.slice(i + 1)]);
    },
    [onChange, values],
  );
  const deleteProperty = React.useCallback(
    (i: number, ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!window.confirm(`Are you sure you want to delete this value?`)) {
        return;
      }
      setEditingProperty(null);
      const newValue = values.slice();
      newValue.splice(i, 1);
      onChange(newValue);
    },
    [onChange, values],
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <label className="form-label">Values</label>
        <button className="btn btn-sm" onClick={add}>
          <PlusIcon />
        </button>
      </div>
      <div className="accordion mb-3">
        {values.map((editValue, i) => {
          const value = valueFromEditValue(editValue, project, namespace);
          return (
            <div key={i} className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={classNames(
                    "accordion-button justify-content-between",
                    i !== editingProperty && "collapsed",
                  )}
                  type="button"
                  onClick={editProperty.bind(null, i)}
                >
                  <div style={{ flex: "auto" }}>
                    <span
                      className={classNames(
                        "text-truncate",
                        i === editingProperty && "fw-bold",
                      )}
                    >
                      {
                        /* FIXME: Try to remove truncate. */ truncate(
                          editValueToString(editValue, project, namespace),
                          { length: 30 },
                        )
                      }
                    </span>
                  </div>
                  {value == null ? (
                    <div className="text-danger me-2">
                      <ExclamationCircle title="Error" />
                    </div>
                  ) : null}
                  <a
                    role="button"
                    className="btn btn-sm py-0 px-1 me-2"
                    onClick={deleteProperty.bind(null, i)}
                  >
                    <TrashIcon height={12} width={12} />
                  </a>
                </button>
              </h2>
              <div
                className={classNames(
                  "accordion-collapse collapse",
                  i === editingProperty && "show",
                )}
              >
                {i === editingProperty ? (
                  <div className="accordion-body">
                    <PropertyValueEdit
                      value={editValue}
                      namespace={namespace}
                      project={project}
                      onChange={changeProperty.bind(null, i)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PropertyValueEdit({
  value,
  onChange,
  project,
  namespace,
}: {
  value: PropertyEditValue;
  onChange: (value: PropertyEditValue) => void;
  project: string;
  namespace: string | null;
}) {
  const id = useID();

  const changeType = React.useCallback(
    (ev) => {
      onChange({ ...value, type: parseInt(ev.target.value, 10) });
    },
    [onChange, value],
  );

  const changeStringValue = React.useCallback(
    (v: string) => {
      onChange({ ...value, stringValue: v });
    },
    [onChange, value],
  );

  const changeBooleanValue = React.useCallback(
    (v: boolean) => {
      onChange({ ...value, booleanValue: v });
    },
    [onChange, value],
  );

  const changeGeoPointValue = React.useCallback(
    (v: { latitude: string; longitude: string }) => {
      onChange({ ...value, geoPointValue: v });
    },
    [onChange, value],
  );

  const changeArrayValue = React.useCallback(
    (v: Array<PropertyEditValue>) => {
      onChange({ ...value, arrayValue: v });
    },
    [onChange, value],
  );

  const changeExcludeFromIndexes = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = {
        ...value,
        ...(ev.target.checked ? { excludeFromIndexes: true } : {}),
      };
      if (!ev.target.checked) {
        delete newValue["excludeFromIndexes"];
      }
      onChange(newValue);
    },
    [onChange, value],
  );
  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Type</label>
        <select
          className="form-select"
          value={value.type}
          onChange={changeType}
        >
          <option value={ValueType.Timestamp}>Timestamp</option>
          <option value={ValueType.String}>String</option>
          <option value={ValueType.Key}>Key</option>
          <option value={ValueType.Null}>Null</option>
          <option value={ValueType.Boolean}>Boolean</option>
          <option value={ValueType.Integer}>Integer</option>
          <option value={ValueType.Double}>Double</option>
          <option value={ValueType.GeoPoint}>GeoPoint</option>
          <option value={ValueType.Array}>Array</option>
          <option value={ValueType.Blob}>Blob</option>
          <option value={ValueType.Entity}>Entity</option>
        </select>
      </div>
      {(() => {
        switch (value.type) {
          case ValueType.String:
            return (
              <TextValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
              />
            );
          case ValueType.Timestamp:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={parseTime}
              />
            );
          case ValueType.Key: {
            let linkURL = undefined;
            try {
              linkURL = `/entities/${encodeKey(
                keyFromString(value.stringValue, project, namespace),
              )}`;
            } catch (e) {
              // pass
            }
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={(v: string) => keyFromString(v, project, namespace)}
                linkURL={linkURL}
                infoURL="https://support.google.com/cloud/answer/6365503#zippy=%2Ckey-literals"
              />
            );
          }
          case ValueType.Integer:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={parseInteger}
                isDisablePretty={true}
              />
            );
          case ValueType.Double:
            return (
              <StringValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
                parse={parseDouble}
                isDisablePretty={true}
              />
            );
          case ValueType.Blob:
            return (
              <BlobValueEdit
                value={value.stringValue}
                onChange={changeStringValue}
              />
            );
          case ValueType.Null:
            return null;
          case ValueType.Boolean:
            return (
              <BooleanValueEdit
                value={value.booleanValue}
                onChange={changeBooleanValue}
              />
            );
          case ValueType.GeoPoint:
            return (
              <GeoPointValueEdit
                value={value.geoPointValue}
                onChange={changeGeoPointValue}
              />
            );
          case ValueType.Array:
            return (
              <ArrayValueEdit
                value={value.arrayValue}
                onChange={changeArrayValue}
                project={project}
                namespace={namespace}
              />
            );
          default:
            return editValueToString(value, project, namespace);
        }
      })()}
      {value.type != ValueType.Array && value.type != ValueType.Entity ? (
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={id}
            onChange={changeExcludeFromIndexes}
            checked={value.excludeFromIndexes ?? false}
          />
          <label className="form-check-label" htmlFor={id}>
            Exclude from indexes
          </label>
        </div>
      ) : null}
    </div>
  );
}
