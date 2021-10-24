import React from "react";
import EntitiesTable from "./EntitiesTable";
import { useGQLQuery } from "./api";
import ErrorMessage from "./ui/ErrorMessage";
import Loading from "./ui/Loading";
import * as qs from "querystringify";
import { useLocation } from "wouter";
import QuestionCircle from "./ui/icons/question-circle";
import useDocumentTitle from "./ui/useDocumentTitle";

function QueryInput({
  initialQuery,
  onRunQuery,
}: {
  initialQuery: string;
  onRunQuery: (q: string) => void;
}) {
  const [query, setQuery] = React.useState(initialQuery);

  const updateQuery = React.useCallback((ev) => {
    setQuery(ev.target.value);
  }, []);

  const runQuery = React.useCallback(
    (ev) => {
      ev.preventDefault();
      onRunQuery(query);
    },
    [onRunQuery, query],
  );

  return (
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
  );
}

export default function QueryPage({ namespace }: { namespace: string | null }) {
  const q = qs.parse(window.location.search) as Record<string, string>;
  const currentQuery = q.q || "";

  useDocumentTitle("Query");

  const [, setLocation] = useLocation();

  const {
    data: queryResults,
    error,
    isLoading,
  } = useGQLQuery(currentQuery, namespace);

  const runQuery = React.useCallback(
    (query: string) => {
      setLocation(
        window.location.pathname +
          "?" +
          qs.stringify({
            ...q,
            q: query,
          }),
      );
    },
    [q, setLocation],
  );

  return (
    <div>
      <QueryInput initialQuery={currentQuery} onRunQuery={runQuery} />
      {error != null ? <ErrorMessage error={error} /> : null}
      {isLoading ? (
        <Loading />
      ) : queryResults != null ? (
        <EntitiesTable entities={queryResults} namespace={namespace} />
      ) : null}
    </div>
  );
}
