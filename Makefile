docker-compose-e2e = ./docker-compose.e2e.yml
docker-compose-unit-tests = ./docker-compose.test.yml

skip_markers ?=

unit-tests: setup-unit-tests run-unit-tests

setup-unit-tests:
	docker-compose -f $(docker-compose-unit-tests) up -d --build
	./scripts/wait-for-postgres.sh localhost 15432 test

run-unit-tests:
	$(eval markers := $(skip_markers) $(if $(skip_markers), and) not e2e)
	docker-compose -f $(docker-compose-unit-tests) exec -T river pytest -m "$(markers)"

e2e-tests: setup-e2e-tests run-e2e-tests

setup-e2e-tests:
	docker-compose -f $(docker-compose-e2e) up -d --build
	./scripts/wait-for-postgres.sh localhost 15432 test
	./scripts/wait-for-webservice.sh http://localhost:8080/hapi
	docker-compose -f $(docker-compose-e2e) exec -T jpaltime \
		java -jar /app/hapi-fhir-cli.jar upload-definitions -v r4 -t http://localhost:8080/hapi/fhir
	docker-compose -f $(docker-compose-e2e) run river-api migrate

run-e2e-tests:
	$(eval markers := $(skip_markers) $(if $(skip_markers), and) e2e)
	docker-compose -f $(docker-compose-e2e) exec -T river-api pytest tests -m "$(markers)"
