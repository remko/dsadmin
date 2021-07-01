import React from "react";
import {
  Entity,
  Key,
  useEntities,
  useKinds,
  useNamespaces,
  useProject,
} from "./api";
import { keyFromString } from "./keys";
import Modal, { ModalProps } from "./ui/Modal";
import classNames from "classnames";
import QuestionCircle from "./ui/icons/question-circle";
import Select from "./ui/Select";
import {
  editValueToString,
  fromEditProperties,
  newEditValue,
  PropertyEditValue,
  valueFromEditValue,
  valueToEditValue,
} from "./properties";
import { truncate } from "lodash";
import ExclamationCircle from "./ui/icons/exclamation-circle";
import TrashIcon from "./ui/icons/trash";
import PropertyValueEdit from "./PropertyValueEdit";
import PlusIcon from "./ui/icons/plus";

enum KeyType {
  ID,
  Name,
}

export default function CreateEntityDialog(
  props: ModalProps & {
    initialKind: string;
    initialNamespace: string | null;
    onCreate: (e: Entity) => void;
  },
) {
  const { onRequestClose, onCreate, initialKind, initialNamespace } = props;

  const project = useProject();
  const [keyType, setKeyType] = React.useState(KeyType.ID);
  const [kind, setKind] = React.useState(initialKind);
  const [namespace, setNamespace] = React.useState(initialNamespace || "");
  const [keyName, setKeyName] = React.useState("");
  const [parentKey, setParentKey] = React.useState("");

  const { data: namespaces } = useNamespaces();
  const { data: kinds } = useKinds(namespace);
  const { data: existingKindEntities } = useEntities(
    (kinds || []).indexOf(kind) >= 0 ? kind : null,
    namespace,
    1,
  );
  const [properties, setProperties] = React.useState<
    Record<string, PropertyEditValue>
  >({});

  const [editingProperty, setEditingProperty] = React.useState<string | null>(
    null,
  );

  const onEditProperty = React.useCallback((property, ev) => {
    ev.preventDefault();
    return setEditingProperty((v) => {
      return v === property ? null : property;
    });
  }, []);

  const handlePropertyValueChange = React.useCallback(
    (name: string, value: PropertyEditValue) => {
      setProperties((v) => ({
        ...v,
        [name]: value,
      }));
    },
    [],
  );

  const addProperty = React.useCallback(() => {
    const name = window.prompt("Enter the name of the property to add");
    if (name == null) {
      return;
    }
    setProperties((v) => ({
      ...v,
      [name]: newEditValue(),
    }));
  }, []);

  const deleteProperty = React.useCallback((name: string, ev) => {
    ev.preventDefault();
    setProperties((v) => {
      const nv = { ...v };
      delete nv[name];
      return nv;
    });
  }, []);

  // Entity
  let parentKeyMessage: string | null = null;
  let entity: Entity | null = null;
  if (keyType == KeyType.ID || keyName !== "") {
    let parsedParentKey = null;
    if (parentKey.length !== 0) {
      try {
        parsedParentKey = keyFromString(parentKey, project, namespace);
      } catch (e) {
        parentKeyMessage = e.message;
      }
    }
    if (parentKeyMessage == null) {
      const entityProperties = fromEditProperties(
        properties,
        project,
        namespace,
      );
      if (entityProperties != null) {
        const key: Key = {
          partitionId: {
            projectId: project,
            ...(namespace == null ? {} : { namespaceId: namespace }),
          },
          path: [],
        };
        if (parsedParentKey != null) {
          key.path = parsedParentKey.path;
        }
        if (keyType == KeyType.Name) {
          key.path.push({ kind, name: keyName });
        } else {
          key.path.push({ kind });
        }
        entity = {
          key,
          properties: entityProperties,
        };
      }
    }
  }

  const createEntity = React.useCallback(() => {
    if (entity == null) {
      return;
    }
    onCreate(entity);
  }, [entity, onCreate]);

  React.useEffect(() => {
    const kindEntities =
      (kinds || []).indexOf(kind) >= 0 ? existingKindEntities : [];
    if (kindEntities == null || kindEntities.length === 0) {
      setProperties({});
      return;
    }
    setProperties(
      Object.entries(kindEntities[0].properties ?? {}).reduce(
        (acc, [name, value]) => {
          const editValue = valueToEditValue(value, project, namespace);
          acc[name] = newEditValue(editValue.type);
          if (editValue.excludeFromIndexes) {
            acc[name].excludeFromIndexes = true;
          }
          return acc;
        },
        {} as Record<string, PropertyEditValue>,
      ),
    );
  }, [existingKindEntities, kind, kinds, namespace, project]);

  return (
    <Modal
      {...props}
      contentLabel="Create Entity"
      title="Create Entity"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRequestClose}
          >
            Close
          </button>
          <button
            disabled={entity == null}
            type="button"
            className="btn btn-primary"
            onClick={createEntity}
          >
            Create Entity
          </button>
        </>
      }
    >
      <div className="mb-3">
        <label className="form-label">Namespace</label>
        <Select
          value={namespace}
          values={(namespaces || []).map((ns) => ({
            label: ns ?? "(Default namespace)",
            value: ns || "",
          }))}
          onChange={setNamespace}
          placeholder="(Default namespace)"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Kind</label>
        <Select value={kind} values={kinds || []} onChange={setKind} />
      </div>
      <div className="mb-3">
        <label className="form-label">Key identifier</label>
        <select
          className="form-select"
          value={keyType}
          onChange={(ev) => setKeyType(parseInt(ev.target.value))}
        >
          <option value={KeyType.ID}>Numeric ID (auto-generated)</option>
          <option value={KeyType.Name}>Name</option>
        </select>
      </div>
      {keyType === KeyType.Name ? (
        <div className="mb-3">
          <label className="form-label">Key name</label>
          <input
            type="text"
            className="form-control"
            value={keyName}
            onChange={(ev) => setKeyName(ev.target.value)}
          />
        </div>
      ) : null}
      <div className="mb-3">
        <label className="form-label">
          Parent key
          <a
            href="https://support.google.com/cloud/answer/6365503#zippy=%2Ckey-literals"
            rel="noreferrer"
            target="_blank"
          >
            <QuestionCircle className="bi ms-2" />
          </a>
        </label>
        <input
          type="text"
          className={classNames(
            "form-control",
            parentKeyMessage && "is-invalid",
          )}
          value={parentKey}
          onChange={(ev) => setParentKey(ev.target.value)}
        />
        {parentKeyMessage != null ? (
          <div className="invalid-feedback">{parentKeyMessage}</div>
        ) : null}
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5">Properties</h3>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={addProperty}
        >
          <PlusIcon />
        </button>
      </div>
      <div className="accordion">
        {Object.entries(properties || []).map(([name, editValue]) => {
          const value =
            editValue != null
              ? valueFromEditValue(editValue, project, namespace)
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
                        {
                          /* FIXME: Try to remove truncate. */ truncate(
                            editValueToString(editValue, project, namespace),
                            { length: 30 },
                          )
                        }
                      </span>
                    ) : null}
                  </div>
                  {value == null ? (
                    <div className="text-danger me-2">
                      <ExclamationCircle />
                    </div>
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
                      namespace={namespace}
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
    </Modal>
  );
}
