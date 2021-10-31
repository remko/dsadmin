package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"os"

	"github.com/remko/dsadmin"
)

func NewAssetFS(root fs.FS, fallback []byte) http.Handler {
	assets := http.FileServer(http.FS(root))
	return http.StripPrefix("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := fs.Stat(root, r.URL.Path); err != nil {
			w.Write(fallback)
			return
		}
		assets.ServeHTTP(w, r)
	}))
}

func main() {
	project := flag.String("project", os.Getenv("DATASTORE_PROJECT_ID"), "Datastore project ID. Defaults to DATASTORE_PROJECT_ID environment variable.")
	port := flag.Uint("port", 8080, "Port to listen on")
	defaultEmulatorHost := os.Getenv("DATASTORE_EMULATOR_HOST")
	if defaultEmulatorHost == "" {
		defaultEmulatorHost = "localhost:8081"
	}
	emulatorHost := flag.String("datastore-emulator-host", defaultEmulatorHost, "Datastore emulator hostname & port. Defaults to DATASTORE_EMULATOR_HOST environment variable.")
	flag.Parse()
	if *project == "" {
		log.Fatalf("missing project setting")
	}
	if *emulatorHost == "" {
		log.Fatalf(("missing datastore emulator host setting"))
	}

	dev := os.Getenv("DSADMIN_DEV") != ""

	var assets fs.FS
	if dev {
		assets = os.DirFS("public")
	} else {
		assets = dsadmin.WebAppAssets
	}

	f, err := assets.Open("index.html")
	if err != nil {
		panic(err)
	}
	index, err := ioutil.ReadAll(f)
	if err != nil {
		panic(err)
	}
	dsadminEnv, err := json.Marshal(map[string]interface{}{
		"DATASTORE_PROJECT_ID": project,
	})
	if err != nil {
		panic(err)
	}
	index = bytes.Replace(index, []byte("<body>"), []byte(fmt.Sprintf("<body><script>DSADMIN_ENV = JSON.parse(\"%s\");</script>", template.JSEscapeString(string(dsadminEnv)))), 1)

	http.Handle("/v1/", &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = "http"
			req.URL.Host = *emulatorHost
			req.Host = *emulatorHost
		}},
	)
	http.Handle("/", NewAssetFS(assets, index))

	log.Printf("dsadmin (project '%s') listening on http://localhost:%d", *project, *port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}
