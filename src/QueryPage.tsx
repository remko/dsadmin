import React from "react";
import EntitiesTable from "./EntitiesTable";
import { useGQLQuery } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import * as qs from "querystringify";
import { useLocation } from "wouter";

export default function QueryPage({ namespace }: { namespace: string | null }) {
  const q = qs.parse(window.location.search) as Record<string, string>;
  const currentQuery = q.q || "";
  const [query, setQuery] = React.useState(currentQuery);

  const [, setLocation] = useLocation();

  const updateQuery = React.useCallback((ev) => {
    setQuery(ev.target.value);
  }, []);

  const {
    data: queryResults,
    error,
    isLoading,
  } = useGQLQuery(currentQuery, namespace);

  const runQuery = React.useCallback(
    (ev) => {
      ev.preventDefault();
      setLocation(
        window.location.pathname +
          "?" +
          qs.stringify({
            ...q,
            q: query,
          }),
      );
    },
    [q, query, setLocation],
  );

  return (
    <div>
      <form className="mb-3">
        <div className="mb-3">
          <label className="form-label">
            GQL Query
            <a
              href="https://cloud.google.com/datastore/docs/reference/gql_reference#grammar"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="currentColor"
                className="bi ms-2"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
              </svg>
            </a>
          </label>
          <textarea
            autoFocus={true}
            className="form-control"
            rows={5}
            value={query}
            onChange={updateQuery}
          />
        </div>
        <button className="btn btn-primary" onClick={runQuery}>
          Run Query
        </button>
      </form>
      {error != null ? <ErrorMessage error={error} /> : null}
      {isLoading ? (
        <Loading />
      ) : queryResults != null ? (
        <EntitiesTable entities={queryResults} />
      ) : null}
    </div>
  );
}
