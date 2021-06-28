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
  newEditValue,
} from "./PropertyValueEdit";
import ExclamationCircle from "./ui/icons/exclamation-circle";
import { keyToString, decodeKey } from "./keys";
import TrashIcon from "./ui/icons/trash";
import PlusIcon from "./ui/icons/plus";

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
  const [editProperties, setEditProperties] = React.useState<Record<
    string,
    PropertyEditValue | null
  > | null>(
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

  const save = React.useCallback(async () => {
    if (editEntity == null) {
      return;
    }
    resetUpdate();
    setEditingProperty(null);
    const newSavedEntity = await updateEntity({ entity: editEntity });
    setEditProperties(
      toEditProperties(
        newSavedEntity.properties,
        key.partitionId.projectId,
        keyNamespace(key),
      ),
    );
  }, [editEntity, key, resetUpdate, updateEntity]);

  const deleteProperty = React.useCallback(
    (property: string, ev: React.MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (
        !window.confirm(
          `Are you sure you want to delete property '${property}'?`,
        )
      ) {
        return;
      }
      setEditingProperty(null);
      setEditProperties((v) => ({
        ...v,
        [property]: null,
      }));
    },
    [],
  );

  const addProperty = React.useCallback(() => {
    const name = window.prompt("Enter the name of the property to add");
    if (name == null) {
      return;
    }
    setEditProperties((v) => ({
      ...v,
      [name]: newEditValue(),
    }));
  }, []);

  const hasUnsaved = React.useMemo(
    () =>
      Object.keys(editEntity?.properties ?? {}).length !==
        Object.keys(savedEntity?.properties ?? {}).length ||
      Object.entries(editEntity?.properties || {}).some(
        ([p, v]) =>
          v == null || !isValueEqual(v, (savedEntity?.properties ?? {})[p]),
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Properties</h2>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={addProperty}
        >
          <PlusIcon />
        </button>
      </div>
      <div className="accordion mb-3">
        {Object.entries(editProperties || []).map(([name, editValue]) => {
          const value =
            editValue != null
              ? valueFromEditValue(
                  editValue,
                  key.partitionId.projectId,
                  keyNamespace(key),
                )
              : null;
          return (
            <div key={name} className="accordion-item">
              <h2 className="accordion-header">
                <button
                  disabled={editValue == null}
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
                        editValue == null && "text-muted",
                      )}
                    >
                      {name}
                    </span>
                    {editValue != null && name !== editingProperty ? (
                      <span className="text-muted text-truncate ms-3">
                        {editValueToString(
                          editValue,
                          project,
                          keyNamespace(key),
                        )}
                      </span>
                    ) : null}
                  </div>
                  {editValue == null ? (
                    <div className="text-muted me-2">(Deleted)</div>
                  ) : value == null ? (
                    <div className="text-danger me-2">
                      <ExclamationCircle />
                    </div>
                  ) : !isValueEqual(value, savedEntity.properties[name]) ? (
                    <div className="text-muted me-2">(Not saved)</div>
                  ) : null}
                  {name === editingProperty ? (
                    <a
                      role="button"
                      className="btn btn-sm py-0 px-1 me-2"
                      onClick={deleteProperty.bind(null, name)}
                    >
                      <TrashIcon height={12} width={12} />
                    </a>
                  ) : null}
                </button>
              </h2>
              <div
                className={classNames(
                  "accordion-collapse collapse",
                  name === editingProperty && "show",
                )}
              >
                {editValue != null && name === editingProperty ? (
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
