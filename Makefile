DOCKER_TAG ?= remko/dsadmin
DOCKER_REPO ?= remko
YARN = yarnpkg
GO_PACKAGE = github.com/remko/dsadmin/cmd/dsadmin

all:

.PHONY: bin/dsadmin
bin/dsadmin:
	go build -o bin/ $(GO_PACKAGE)

.PHONY: binaries-dist
binaries-dist: js-build js-lint js-test
	env GOOS=darwin GOARCH=amd64 go build -o bin/dsadmin-macosx-amd64 $(GO_PACKAGE)
	env GOOS=darwin GOARCH=arm64 go build -o bin/dsadmin-macosx-arm64 $(GO_PACKAGE)
	env GOOS=linux GOARCH=amd64 go build -o bin/dsadmin-linux-amd64 $(GO_PACKAGE)
	env GOOS=windows GOARCH=amd64 go build -o bin/dsadmin-windows-amd64.exe $(GO_PACKAGE)


docker:
	docker build -t $(DOCKER_TAG) .

docker-push:
	docker push $(DOCKER_TAG)

.PHONY: ko
ko: js-build js-lint js-test
	ko publish --local -B $(GO_PACKAGE)

.PHONY: ko
ko-publish: js-build js-lint js-test
	env KO_DOCKER_REPO=$(DOCKER_REPO) ko publish -B $(GO_PACKAGE)

.PHONY: js-build
js-build:
	$(YARN) run build

.PHONY: js-lint
js-lint:
	$(YARN) run lint

.PHONY: js-test
js-test:
	$(YARN) run test

.PHONY: clean
clean:
	-rm -rf bin/dsadmin-* build