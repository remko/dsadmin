import React from "react";
import ReactDOM from "react-dom";
import DatastoreAdmin from "./DatastoreAdmin";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";

declare let __SNOWPACK_ENV__: Record<string, string>;

declare let window: Window & {
  DSADMIN_ENV?: Record<string, string>;
};

ReactDOM.render(
  <React.StrictMode>
    <DatastoreAdmin
      project={
        (window.DSADMIN_ENV || {}).DATASTORE_PROJECT_ID ??
        __SNOWPACK_ENV__.DATASTORE_PROJECT_ID
      }
    />
  </React.StrictMode>,
  document.getElementById("root"),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
