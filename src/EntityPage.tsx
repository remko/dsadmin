import React from "react";
import { Link } from "wouter";
import {
  useEntity,
  keyNamespace,
  useUpdateEntity,
  Entity,
  useProject,
} from "./api";
import { namespacedLocation } from "./locations";
import { isValueEqual, truncate } from "./properties";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import classNames from "classnames";
import PropertyValueEdit, {
  fromEditProperties,
  PropertyEditValue,
  toEditProperties,
  editValueToString,
  valueFromEditValue,
} from "./PropertyValueEdit";
import ExclamationCircle from "./ui/icons/exclamation-circle";
import { keyToString, decodeKey } from "./keys";

export default function EntityPage({
  entityKey: encodedKey,
}: {
  entityKey: string;
}) {
  const project = useProject();
  const key = decodeKey(encodedKey);

  const { data: savedEntity, error: entityError } = useEntity(key);
  const {
    mutateAsync: updateEntity,
    error: updateError,
    isLoading: isUpdating,
    reset: resetUpdate,
  } = useUpdateEntity();
  const error = entityError ?? updateError;

  const [editingProperty, setEditingProperty] = React.useState<string | null>(
    null,
  );
  const [editProperties, setEditProperties] = React.useState(
    savedEntity == null
      ? null
      : toEditProperties(
          savedEntity.properties,
          key.partitionId.projectId,
          keyNamespace(key),
        ),
  );

  React.useEffect(() => {
    if (editProperties == null && savedEntity != null) {
      setEditProperties(
        toEditProperties(
          savedEntity.properties,
          key.partitionId.projectId,
          keyNamespace(key),
        ),
      );
    }
  }, [editProperties, key, savedEntity]);

  const onEditProperty = React.useCallback((property, ev) => {
    ev.preventDefault();
    return setEditingProperty((v) => {
      return v === property ? null : property;
    });
  }, []);

  const handlePropertyValueChange = React.useCallback(
    (property: string, value: PropertyEditValue) => {
      if (editProperties == null) {
        return;
      }
      setEditProperties({
        ...editProperties,
        [property]: value,
      });
    },
    [editProperties],
  );

  const editEntity = React.useMemo((): Entity | null => {
    if (editProperties == null || savedEntity == null) {
      return null;
    }
    const properties = fromEditProperties(
      editProperties,
      key.partitionId.projectId,
      keyNamespace(key),
    );
    if (properties == null) {
      return null;
    }
    return { ...savedEntity, properties };
  }, [editProperties, key, savedEntity]);

  const discard = React.useCallback(() => {
    if (savedEntity == null) {
      return;
    }
    resetUpdate();
    setEditingProperty(null);
    setEditProperties(
      toEditProperties(
        savedEntity.properties,
        key.partitionId.projectId,
        keyNamespace(key),
      ),
    );
  }, [key, resetUpdate, savedEntity]);

  const save = React.useCallback(() => {
    if (editEntity == null) {
      return;
    }
    resetUpdate();
    setEditingProperty(null);
    updateEntity({ entity: editEntity });
  }, [editEntity, resetUpdate, updateEntity]);

  const hasUnsaved = React.useMemo(
    () =>
      Object.entries(editEntity?.properties || []).some(
        ([p, v]) => !isValueEqual(v, (savedEntity?.properties ?? {})[p]),
      ),
    [savedEntity, editEntity],
  );

  if (savedEntity == null || editProperties == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }
  const lkey = key.path[key.path.length - 1];

  return (
    <div>
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link
            href={namespacedLocation(`/kinds/${lkey.kind}`, keyNamespace(key))}
          >
            {lkey.kind}
          </Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {truncate(
            keyToString(savedEntity.key, project, keyNamespace(key)),
            80,
          )}
        </li>
      </ol>
      <h1>Entity</h1>
      <form>
        {lkey.name != null ? (
          <div className="mb-3">
            <label className="form-label">Key Name</label>
            <div className="form-control-plaintext">{lkey.name}</div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Key ID</label>
            <div className="form-control-plaintext">{lkey.id}</div>
          </div>
        )}
      </form>
      <h2 className="mb-3">Properties</h2>
      <div className="accordion mb-3">
        {Object.entries(editProperties || []).map(([name, editValue]) => {
          const value = valueFromEditValue(
            editValue,
            key.partitionId.projectId,
            keyNamespace(key),
          );
          return (
            <div key={name} className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={classNames(
                    "accordion-button justify-content-between",
                    name !== editingProperty && "collapsed",
                  )}
                  type="button"
                  onClick={onEditProperty.bind(null, name)}
                >
                  <div style={{ flex: "auto" }}>
                    <span
                      className={classNames(
                        name === editingProperty && "fw-bold",
                      )}
                    >
                      {name}
                    </span>
                    {name !== editingProperty ? (
                      <span className="text-muted text-truncate ms-3">
                        {editValueToString(
                          editValue,
                          project,
                          keyNamespace(key),
                        )}
                      </span>
                    ) : null}
                  </div>
                  {value == null ? (
                    <div className="text-danger me-2">
                      <ExclamationCircle />
                    </div>
                  ) : !isValueEqual(value, savedEntity.properties[name]) ? (
                    <div className="text-muted me-2">(Not saved)</div>
                  ) : null}
                </button>
              </h2>
              <div
                className={classNames(
                  "accordion-collapse collapse",
                  name === editingProperty && "show",
                )}
              >
                {name === editingProperty ? (
                  <div className="accordion-body">
                    <PropertyValueEdit
                      value={editValue}
                      namespace={keyNamespace(key)}
                      project={project}
                      onChange={handlePropertyValueChange.bind(null, name)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {updateError != null ? <ErrorMessage error={updateError} /> : null}
      <div>
        <button
          className="btn btn-primary"
          disabled={!hasUnsaved || isUpdating || editEntity == null}
          onClick={save}
        >
          Save
          {isUpdating ? <Loading small={true} className="ms-2" /> : null}
        </button>
        <button
          className="btn btn-outline-secondary ms-2"
          onClick={discard}
          disabled={editEntity != null && (!hasUnsaved || isUpdating)}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
