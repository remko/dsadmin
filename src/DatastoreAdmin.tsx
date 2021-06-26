import React from "react";
import { APIProvider, useExport, useImport } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import ScrollToTop from "./ui/ScrollToTop";
import Loading from "./ui/Loading";
import { Link, Route, Switch, useLocation, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import classNames from "classnames";
import QueryPage from "./QueryPage";
import KindPage from "./KindPage";
import EntityPage from "./EntityPage";
import HomePage from "./HomePage";
import NamespaceSelector from "./NamespaceSelector";
import { namespacedLocation, namespaceForLocation } from "./locations";
import DatastoreIcon from "./ui/icons/datastore";

function DatastoreAdminView({ project }: { project: string }) {
  const { mutateAsync: export_, isLoading: isExportLoading } = useExport();
  const { mutateAsync: import_, isLoading: isImportLoading } = useImport();

  const [location] = useLocation();
  const namespace = React.useMemo(
    () => namespaceForLocation(location),
    [location],
  );

  const onImport = React.useCallback(
    async (ev) => {
      ev.preventDefault();
      const inputPath = prompt("Enter the path to the export");
      if (!inputPath || inputPath == "") {
        return;
      }
      try {
        const r = await import_({ inputPath });
        return r;
      } catch (e) {
        alert(e.message);
      }
    },
    [import_],
  );

  const onExport = React.useCallback(
    async (ev) => {
      ev.preventDefault();
      const outputPath = prompt("Enter the output dir to export to");
      if (!outputPath || outputPath == "") {
        return;
      }
      try {
        const r = await export_({ outputPath: outputPath });
        alert(`Exported to "${r.outputURL}"`);
      } catch (e) {
        alert(e.message);
      }
    },
    [export_],
  );

  const [isQueryRoute] = useRoute("/query");
  const [isNamespaceQueryRoute] = useRoute("/namespaces/:namespace/query");

  const isLoading = isExportLoading ?? isImportLoading;

  return (
    <>
      <ScrollToTop />
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand mb-0 h1" href="/">
            <DatastoreIcon className="me-2" />
            Datastore Admin
          </Link>

          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={classNames(
                  "nav-link",
                  !isQueryRoute && !isNamespaceQueryRoute && "active",
                )}
                href={namespacedLocation("/", namespace)}
              >
                Browse
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={classNames(
                  "nav-link",
                  (isQueryRoute || isNamespaceQueryRoute) && "active",
                )}
                href={namespacedLocation("/query", namespace)}
              >
                Query
              </Link>
            </li>
            <li className="nav-item">
              <a
                role="button"
                className="nav-link"
                aria-current="page"
                href="/import"
                onClick={onImport}
              >
                Import
              </a>
            </li>
            <li className="nav-item">
              <a
                role="button"
                className="nav-link"
                aria-current="page"
                href="/export"
                onClick={onExport}
              >
                Export
              </a>
            </li>
          </ul>
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item me-3">
              <NamespaceSelector namespace={namespace} />
            </li>
            <li className="navbar-text">{project}</li>
          </ul>
        </div>
      </nav>
      <div className="container mt-3 mb-3">
        {/* {error != null ? <ErrorMessage error={error} /> : null} */}
        {isLoading ? <Loading /> : null}
        <Switch>
          <Route path="/kinds/:kind">
            {({ kind }) => <KindPage kind={kind} page={0} namespace={null} />}
          </Route>
          <Route path="/kinds/:kind/:page">
            {({ kind, page }) => (
              <KindPage
                kind={kind}
                page={parseInt(page, 10)}
                namespace={null}
              />
            )}
          </Route>
          <Route path="/namespaces/:namespace/kinds/:kind">
            {({ kind, namespace }) => (
              <KindPage kind={kind} page={0} namespace={namespace} />
            )}
          </Route>
          <Route path="/namespaces/:namespace/kinds/:kind/:page">
            {({ kind, namespace, page }) => (
              <KindPage
                kind={kind}
                page={parseInt(page, 10)}
                namespace={namespace}
              />
            )}
          </Route>
          <Route path="/query">
            <QueryPage namespace={null} />
          </Route>
          <Route path="/namespaces/:namespace/query">
            {({ namespace }) => <QueryPage namespace={namespace} />}
          </Route>
          <Route path="/entities/:entityKey">
            {({ entityKey }) => <EntityPage entityKey={entityKey} />}
          </Route>
          <Route path="/namespaces/:namespace">
            {({ namespace }) => <HomePage namespace={namespace} />}
          </Route>
          <Route path="/">
            <HomePage namespace={null} />
          </Route>
        </Switch>
      </div>
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function DatastoreAdmin({ project }: { project: string }) {
  if (project == null) {
    return <ErrorMessage error="missing project" />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <APIProvider project={project}>
        <DatastoreAdminView project={project} />
        <ReactQueryDevtools position="bottom-right" />
      </APIProvider>
    </QueryClientProvider>
  );
}

export default DatastoreAdmin;
