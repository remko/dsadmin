DOCKER_TAG ?= remko/dsadmin

all:

docker:
	docker build -t $(DOCKER_TAG) .

docker-push:
	docker push $(DOCKER_TAG)