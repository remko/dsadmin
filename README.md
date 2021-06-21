# DSAdmin: Google Cloud Datastore Emulator Admin UI

Admin UI for the Google Cloud Datastore Emulator.

- Supports browsing, deleting, querying (using GQL), import, export, ...
- Supports large databases
- Does not have problematic dependencies (such as gRPC, which are not available
  on all platforms)
- Hackable: Implemented entirely in the frontend as an SPA of only 1000 lines of code. 
  Uses the [Datastore REST API](https://cloud.google.com/datastore/docs/reference/data/rest) directly from
  the frontend. 
- Portable: The only thing a server is used for is for proxying to the datastore emulator 
  (to avoid CORS problems), and to serve the HTML and JS files. This means that the
  server (written in Node.JS) can easily be ported to other languages if you want
  to avoid a dependency on Node.JS.


## Why?

Since Google stopped shipping an admin interface for their Datastore Emulator,
there have been some external projects trying to fill the gap. However, all of
the ones I tried were either partially or completely broken, lacked in core
features, had performance issues, were painful to set up, or had dependencies
that prevented them from e.g. being installed in a non-x86 Docker image.

This project tries to fix all of the issues with the other Datastore admin
interfaces, and even improve on the original Google interface in some areas.


## Not yet implemented

- Editing (Coming soon)
- Namespace support
- Sorting & filtering from the browser
- Creating new entities
- Adding/removing properties to entities

Neither of these are particularly difficult, but I just haven't needed them yet.
Create an issue in the tracker if you want one of these features urgently.


## Usage

Using the environment from the emulator:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    npx dsadmin

Using command-line arguments:

    npx dsadmin --project=my-datastore-project --datastore-emulator-host=localhost:7081


## Development

Start the development server:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    npm start

Using command-line:

    env DATASTORE_PROJECT_ID=my-datastore-project \
      DATASTORE_EMULATOR_HOST=localhost:7081 \
      npm start
