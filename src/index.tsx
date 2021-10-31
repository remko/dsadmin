import React from "react";
import ReactDOM from "react-dom";
import DatastoreAdmin from "./DatastoreAdmin";
import Modal from "react-modal";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";

declare let window: Window & {
  DSADMIN_ENV?: Record<string, string>;
};

Modal.setAppElement(document.getElementById("root")!);

ReactDOM.render(
  <React.StrictMode>
    <DatastoreAdmin project={(window.DSADMIN_ENV || {}).DATASTORE_PROJECT_ID} />
  </React.StrictMode>,
  document.getElementById("root"),
);
