import React from "react";
import ReactDOM from "react-dom";
import DatastoreAdmin from "./DatastoreAdmin";
import Modal from "react-modal";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";

declare let window: Window & {
  DSADMIN_ENV: {
    DATASTORE_PROJECT_ID: string;
    BASE_PATH: string;
  };
};

Modal.setAppElement(document.getElementById("root")!);

ReactDOM.render(
  <React.StrictMode>
    <DatastoreAdmin
      project={window.DSADMIN_ENV.DATASTORE_PROJECT_ID}
      base={window.DSADMIN_ENV.BASE_PATH}
    />
  </React.StrictMode>,
  document.getElementById("root"),
);
