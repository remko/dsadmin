import React from "react";
import { APIProvider, useExport, useImport } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import ScrollToTop from "./ui/ScrollToTop";
import Loading from "./ui/Loading";
import { Link, Route, Switch, useLocation, useRoute, Router } from "wouter";
import makeCachedMatcher from "wouter/matcher";
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
import { pathToRegexp, Key as PTRKey } from "path-to-regexp";
import * as qs from "querystringify";

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

  const [isQueryRoute] = useRoute("{/namespaces/:namespace}?/query");

  const isLoading = isExportLoading ?? isImportLoading;

  return (
    <>
      <ScrollToTop />
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand mb-0 h1" href="/">
            <DatastoreIcon className="me-2" fill="#4285F4" />
            Datastore Admin
          </Link>

          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={classNames("nav-link", !isQueryRoute && "active")}
                href={namespacedLocation("/", namespace)}
              >
                Browse
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={classNames("nav-link", isQueryRoute && "active")}
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
        {isLoading ? <Loading /> : null}
        <Switch>
          <Route path="{/namespaces/:namespace}?/kinds/:kind">
            {({ kind, namespace }) => {
              const { page, pageSize } = qs.parse(
                window.location.search,
              ) as Record<string, string>;
              return (
                <KindPage
                  kind={kind}
                  page={page == null ? 0 : parseInt(page, 10) || 0}
                  pageSize={
                    pageSize == null ? 50 : parseInt(pageSize, 10) || 50
                  }
                  namespace={namespace ?? null}
                />
              );
            }}
          </Route>
          <Route path="{/namespaces/:namespace}?/query">
            {({ namespace }) => <QueryPage namespace={namespace ?? null} />}
          </Route>
          <Route path="/entities/:entityKey">
            {({ entityKey }) => <EntityPage entityKey={entityKey} />}
          </Route>
          <Route path="{/namespaces/:namespace}?/">
            {({ namespace }) => <HomePage namespace={namespace ?? null} />}
          </Route>
        </Switch>
      </div>
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

const routeMatcher = makeCachedMatcher((path) => {
  const keys: PTRKey[] = [];
  const regexp = pathToRegexp(path, keys, { strict: true });
  return { keys, regexp };
});

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
        <Router matcher={routeMatcher}>
          <DatastoreAdminView project={project} />
        </Router>
        <ReactQueryDevtools position="bottom-right" />
      </APIProvider>
    </QueryClientProvider>
  );
}

export default DatastoreAdmin;
