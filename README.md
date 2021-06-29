# DSAdmin: Google Cloud Datastore Emulator Admin UI

Administration GUI for the Google Cloud Datastore Emulator.

- Supports browsing, editing, creating, deleting, querying (using GQL), import, export, ...
- Supports large databases
- Does not have problematic dependencies (such as gRPC, which are not available
  on all platforms)
- Hackable: Implemented entirely in the frontend as an SPA. 
  Uses the [Datastore REST API](https://cloud.google.com/datastore/docs/reference/data/rest) directly from
  the frontend. 
- Portable: The only thing a server is used for is for proxying to the datastore emulator 
  (to avoid CORS problems), and to serve the HTML and JS files. 
  The NPM package uses a small Node.js server. A small [self-contained binary server](https://github.com/remko/dsadmin/releases)
  is also provided, avoiding the need for any system dependencies.
  If for some reason you need this to be available in a specific environment (Java, Python, ...), it should 
  be easy to create a similar server to run this in.
  

## Why?

Since Google stopped shipping an admin interface for their Datastore Emulator,
there have been some external projects trying to fill the gap. However, all of
the ones I tried were either partially or completely broken, lacked in core
features, had performance issues, were painful to set up, or had dependencies
that prevented them from e.g. being installed in a non-x86 Docker image.

This project tries to fix all of the issues with the other Datastore admin
interfaces, and even improve on the original Google interface in some areas.


## Not yet implemented

- Creating new entities with ancestor keys or new kinds
- Property editors:
  - Nested entity
  - Array
- Sorting & filtering from the browser


## Usage

### Using NPM

Using the environment from the emulator:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    npx dsadmin

Using command-line arguments:

    npx dsadmin --project=my-datastore-project --datastore-emulator-host=localhost:8081

### Using a pre-built binary

Download the correct binary for your OS 
from the [Releases page](https://github.com/remko/dsadmin/releases).

Start using the environment from the emulator:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    ./dsadmin
    
Start using command-line arguments:

    ./dsadmin --project=my-datastore-project --datastore-emulator-host=localhost:8081

### Using Docker

    docker run -p 8080:8080 remko/dsadmin \
      --project=my-project --datastore-emulator-host=host.docker.internal:8081

### Using Docker Compose

Assuming you have a `datastore` container defined running the Google Cloud Datastore
Emulator, add an entry to your `docker-compose.yml`:

    dsadmin:
      image: "remko/dsadmin:latest"
      depends_on:
        - datastore
      ports:
        - "8080:8080"
      environment:
        DATASTORE_PROJECT_ID: my-project
        DATASTORE_EMULATOR_HOST: "datastore:8081"

## Development

Start a Datastore emulator:

    npm run start-emulator
    
Start the development server:

    npm start

If you want to run against your own running instance of the Datastore emulator:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    npm start

Using command-line:

    env DATASTORE_PROJECT_ID=my-datastore-project \
      DATASTORE_EMULATOR_HOST=localhost:7081 \
      npm start
