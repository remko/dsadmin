import React from "react";
import EntitiesTable from "./EntitiesTable";
import { useGQLQuery } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import * as qs from "querystringify";
import { useLocation } from "wouter";
import QuestionCircle from "./ui/icons/question-circle";

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
              <QuestionCircle className="bi ms-2" />
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
        <EntitiesTable entities={queryResults} namespace={namespace} />
      ) : null}
    </div>
  );
}
