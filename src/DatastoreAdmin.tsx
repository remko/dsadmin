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
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0"
              y="0"
              width="32"
              height="32"
              className="me-2"
              viewBox="0, 0, 202, 202"
            >
              <g>
                <path
                  d="M193.955,91.776 L154.854,23.772 C151.867,18.457 146.29,15.119 140.194,15 L61.977,15 C55.885,15.104 50.305,18.432 47.317,23.742 L8.201,91.597 C5.169,96.861 5.169,103.341 8.201,108.605 L47.303,176.996 C50.262,182.377 55.825,185.813 61.962,186.05 L140.18,186.05 C146.315,185.836 151.887,182.415 154.854,177.04 L193.955,109.037 C197.002,103.686 197.002,97.126 193.955,91.776 z"
                  fill="#4285F4"
                />
                <path
                  d="M133.058,80.744 L118.919,81.874 L118.919,91.047 L108.512,80.64 L94.804,82.127 L94.804,91.211 L84.248,80.655 L69.083,95.968 L78.539,105.424 L69.366,105.766 L69.158,120.425 L134.753,185.976 L140.18,185.976 C146.315,185.762 151.887,182.341 154.854,176.966 L182.031,129.688 z"
                  fill="#000000"
                  opacity="0.07"
                />
                <path
                  d="M82.999,80.179 L70.347,80.179 C69.354,80.179 68.548,80.984 68.548,81.978 L68.548,94.69 C68.548,95.683 69.354,96.488 70.347,96.488 L82.999,96.488 C83.993,96.488 84.798,95.683 84.798,94.69 L84.798,81.978 C84.79,80.988 83.99,80.187 82.999,80.179"
                  fill="#FFFFFF"
                />
                <path
                  d="M107.397,104.562 L94.745,104.562 C93.751,104.562 92.946,105.367 92.946,106.36 L92.946,119.072 C92.946,120.066 93.751,120.871 94.745,120.871 L107.397,120.871 C108.39,120.871 109.196,120.066 109.196,119.072 L109.196,106.36 C109.196,105.367 108.39,104.562 107.397,104.562"
                  fill="#FFFFFF"
                />
                <path
                  d="M131.809,104.562 L119.142,104.562 C118.149,104.562 117.343,105.367 117.343,106.36 L117.343,119.072 C117.343,120.066 118.149,120.871 119.142,120.871 L131.794,120.871 C132.284,120.891 132.761,120.711 133.115,120.371 C133.468,120.032 133.668,119.562 133.668,119.072 L133.668,106.36 C133.668,105.367 132.862,104.562 131.869,104.562"
                  fill="#FFFFFF"
                />
                <path
                  d="M82.999,104.562 L70.347,104.562 C69.354,104.562 68.548,105.367 68.548,106.36 L68.548,119.072 C68.548,120.066 69.354,120.871 70.347,120.871 L82.999,120.871 C83.96,120.824 84.717,120.034 84.724,119.072 L84.724,106.375 C84.716,105.385 83.915,104.584 82.925,104.576 M81.111,117.243 L72.191,117.243 L72.191,108.204 L81.23,108.204 z"
                  fill="#FFFFFF"
                />
                <path
                  d="M107.397,80.179 L94.745,80.179 C93.751,80.179 92.946,80.984 92.946,81.978 L92.946,94.69 C92.946,95.683 93.751,96.488 94.745,96.488 L107.397,96.488 C108.39,96.488 109.196,95.683 109.196,94.69 L109.196,81.978 C109.196,80.984 108.39,80.179 107.397,80.179 M105.538,92.846 L96.618,92.846 L96.618,83.807 L105.538,83.807 z"
                  fill="#FFFFFF"
                />
                <path
                  d="M131.809,80.179 L119.157,80.179 C118.672,80.167 118.203,80.351 117.856,80.69 C117.509,81.028 117.313,81.493 117.313,81.978 L117.313,94.69 C117.313,95.683 118.119,96.488 119.112,96.488 L131.765,96.488 C132.259,96.517 132.744,96.34 133.104,96 C133.465,95.659 133.668,95.185 133.668,94.69 L133.668,81.978 C133.66,80.988 132.859,80.187 131.869,80.179 M130.055,92.846 L121.015,92.846 L121.015,83.807 L130.055,83.807 z"
                  fill="#FFFFFF"
                />
              </g>
            </svg>
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
      <div className="container mt-3">
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
