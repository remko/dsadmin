GO_PACKAGE = ./cmd/dsadmin

.PHONY: all
all: build-js bin

.PHONY: bin
bin:
	go build -o bin/ ./cmd/...

.PHONY: build-js
build-js:
	yarnpkg run build

.PHONY: ko
ko: build-js
	ko publish --local -B --tags latest --tags $(shell git describe) $(GO_PACKAGE)

.PHONY: clean
clean:
	-rm -rf $(patsubst cmd/%, bin/%, $(wildcard cmd/*))	build coverage