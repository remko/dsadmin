<img src="./doc/logo.svg" height="150">

# DSAdmin: Google Cloud Datastore Emulator Admin UI

[![Build](https://github.com/remko/dsadmin/actions/workflows/build.yml/badge.svg)](https://github.com/remko/dsadmin/actions/workflows/build.yml)

Administration GUI for the Google Cloud Datastore Emulator.

- Supports browsing, editing, creating, deleting, querying (using GQL),
  import, export, ...
- Supports formatted display of JSON properties & compressed properties
- Supports large databases
- Does not have problematic dependencies (such as gRPC, which are not
  available on all platforms)
- Portable: Implemented entirely in the frontend as an SPA. Uses the
  [Datastore REST
  API](https://cloud.google.com/datastore/docs/reference/data/rest)
  directly from the frontend. The only thing a server is used for is for
  proxying to the datastore emulator (to avoid CORS problems), and to
  serve the HTML and JS files. The NPM package uses a small Node.js
  server. A small [self-contained binary
  server](https://github.com/remko/dsadmin/releases) is also provided,
  avoiding the need for any system dependencies. If for some reason you
  need this to be available in a specific environment (Java, Python,
  ...), it should be easy to create a similar server to run this in.

## 📷 Screenshots

<div align="center">
<img src="https://raw.githubusercontent.com/remko/dsadmin/master/doc/screenshot-entity.png" width=250 alt="Entity editor"/></a>&nbsp;<img src="https://raw.githubusercontent.com/remko/dsadmin/master/doc/screenshot-kind.png" alt="Kinds" width=250/>&nbsp;<img src="https://raw.githubusercontent.com/remko/dsadmin/master/doc/screenshot-create.png" alt="Entity creator" width=250/>
</div>

## ❓ Why?

Since Google stopped shipping an admin interface for their Datastore
Emulator, there have been some external projects trying to fill the gap.
However, all of the ones I tried were either partially or completely
broken, lacked in core features, had performance issues, were painful to
set up, or had dependencies that prevented them from e.g. being
installed in a non-x86 Docker image.

This project tries to fix all of the issues with the other Datastore
admin interfaces, and bring improvements on the original Google
interface.

## 🚧 Not yet implemented

- Editing nested entities
- UI for filtering & projecting

## 📖 Usage

### Using NPM

Using the environment from the emulator:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    npx dsadmin

Using command-line arguments:

    npx dsadmin --project=my-datastore-project --datastore-emulator-host=localhost:8081

### Using a pre-built binary

Download the correct binary for your OS from the [Releases
page](https://github.com/remko/dsadmin/releases).

Start using the environment from the emulator:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    ./dsadmin

Start using command-line arguments:

    ./dsadmin --project=my-datastore-project --datastore-emulator-host=localhost:8081

### Using Docker

    docker run -p 8080:8080 ghcr.io/remko/dsadmin:latest \
      --project=my-project --datastore-emulator-host=host.docker.internal:8081

### Using Docker Compose

Create a `docker-compose.yml` that starts the Datastore Emulator and the
Datastore Admin container:

``` yaml
version: "3.9"
services:
  # DSAdmin container
  dsadmin:
    image: "ghcr.io/remko/dsadmin:latest"
    depends_on:
      - datastore
    ports:
      - "8080:8080"
    environment:
      DATASTORE_PROJECT_ID: my-datastore-project
      DATASTORE_EMULATOR_HOST: "datastore:8081"

  # Datastore Emulator container
  datastore:
    image: "gcr.io/google.com/cloudsdktool/cloud-sdk:latest"
    volumes:
      - datastore_data:/opt/datastore/data
    ports:
      - "8081:8081"
    command: [
      "gcloud", "--quiet", "beta", "emulators" ,"datastore", "start", 
      "--host-port=0.0.0.0:8081", "--data-dir=/opt/datastore/data"
    ]
    environment:
      CLOUDSDK_CORE_PROJECT: my-datastore-project

volumes:
  datastore_data:
```

## 💻 Development

Install all dependencies

    yarn

Start all development servers (datastore emulator, proxy, and frontend
build):

    yarn start

If you want to run against your own running instance of the Datastore
emulator, start the backend server and the build server separately:

    eval $(gcloud beta emulators datastore env-init --data-dir=DATA-DIR)
    ./bin/dsadmin.js
    yarn run start-build

or using command-line arguments:

    ./bin/dsadmin.js --project=my-datastore-project --datastore-emulator-host=localhost:8081
    yarn run start-build

## 🔋 Powered by ...

This project uses some great open source projects. Check them out if you
don't know them.

<div align="center">
<a href="https://react-query.tanstack.com"><img src="https://raw.githubusercontent.com/TanStack/query/v3/docs/src/images/logo.svg" height=70 alt="React Query"/></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://react-table.tanstack.com"><img src="https://raw.githubusercontent.com/TanStack/table/v7/docs/src/images/logo-light.svg" height=75 alt="React Table"/></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/google/ko"><img src="https://github.com/google/ko/raw/main/docs/images/ko.png" height=75 alt="ko"/></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://esbuild.github.io"><img src="https://raw.githubusercontent.com/evanw/esbuild/master/images/logo.png" height=75 alt="ESBuild"/></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/molefrog/wouter"><img src="https://raw.githubusercontent.com/molefrog/wouter/master/assets/logo.svg" height=75 alt="Wouter"/></a>
</div>
