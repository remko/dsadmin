import React from "react";
import { Entity, useCreateEntity, useKinds, useNamespaces } from "./api";
import { useLocation } from "wouter";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import { namespacedLocation } from "./locations";
import CreateEntityDialog from "./CreateEntityDialog";
import { encodeKey } from "./keys";

export default function HomePage({ namespace }: { namespace: string | null }) {
  const { data: namespaces, error: namespacesError } = useNamespaces();
  const { data: kinds, error: kindsError } = useKinds(namespace);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (kinds == null || kinds.length === 0) {
      return;
    }
    setLocation(namespacedLocation(`/kinds/${kinds[0]}`, namespace), {
      replace: true,
    });
  }, [kinds, namespace, setLocation]);

  // When we have an empty page, try to find a namespace that has kinds
  React.useEffect(() => {
    if (kinds == null || namespaces == null || kinds.length !== 0) {
      return;
    }
    const nonEmptyNamespace = namespaces.find((n) => n !== namespace);
    if (nonEmptyNamespace === undefined) {
      return;
    }
    setLocation(namespacedLocation(`/`, nonEmptyNamespace), {
      replace: true,
    });
  }, [kinds, namespace, namespaces, setLocation]);

  const [createEntityDialogIsOpen, setCreateEntityDialogIsOpen] =
    React.useState(false);
  const openCreateEntityDialog = React.useCallback(() => {
    setCreateEntityDialogIsOpen(true);
  }, []);
  const closeCreateEntityDialog = React.useCallback(() => {
    setCreateEntityDialogIsOpen(false);
  }, []);
  const {
    mutateAsync: createEntity,
    error: createError,
    reset: resetCreateEntity,
  } = useCreateEntity();
  const addEntity = React.useCallback(
    async (e: Entity) => {
      resetCreateEntity();
      setCreateEntityDialogIsOpen(false);
      const entity = await createEntity(e);
      setLocation(`/entities/${encodeKey(entity.key)}`);
    },
    [createEntity, resetCreateEntity, setLocation],
  );

  const error = kindsError ?? namespacesError ?? createError;

  if (kinds == null) {
    return error == null ? <Loading /> : <ErrorMessage error={error} />;
  }

  if (kinds.length === 0) {
    return (
      <>
        <div className="alert alert-info">
          <p>No data in this project</p>
          <button
            className="btn btn-primary"
            onClick={(ev) => {
              ev.preventDefault();
              openCreateEntityDialog();
            }}
          >
            Create Entity
          </button>
        </div>
        {error != null ? <ErrorMessage error={error} /> : null}
        {createEntityDialogIsOpen ? (
          <CreateEntityDialog
            isOpen={true}
            onRequestClose={closeCreateEntityDialog}
            onCreate={addEntity}
            initialKind={""}
            initialNamespace={namespace}
          />
        ) : null}
      </>
    );
  }
  return null;
}
