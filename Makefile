DOCKER_PROJECT=fhir-river
DOCKER_USER=arkhn
DOCKER_IMAGE=$(DOCKER_USER)/$(DOCKER_PROJECT)
GITHUB_SHA?=latest
DOCKER_TAG=$(GITHUB_SHA)

# == all ======================================================================
all: install build

# == install ==================================================================

install:
	virtualenv .
	( \
		. bin/activate; \
		pip install --trusted-host pypi.python.org -r requirements.txt; \
		python setup.py install; \
	)

# == build ====================================================================
build: Dockerfile
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) -f Dockerfile .

# == publish ====================================================================
publish:
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
