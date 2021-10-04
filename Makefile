docker-compose-e2e = ./e2e/docker-compose.yml
docker-compose-unit-tests = ./docker-compose.test.yml

skip_markers ?=

unit-tests: setup-unit-tests run-unit-tests

setup-unit-tests:
	docker-compose -f $(docker-compose-unit-tests) up -d --build
	POSTGRES_USER=mimic POSTGRES_PASSWORD=mimic ./scripts/wait-for-postgres.sh localhost 15432 mimic

run-unit-tests:
	$(eval markers := $(skip_markers) $(if $(skip_markers), and) not e2e)
	docker-compose -f $(docker-compose-unit-tests) run --entrypoint pytest river -m "$(markers)"

e2e-tests: setup-e2e-tests run-e2e-tests

setup-e2e-tests:
	docker-compose -f $(docker-compose-e2e) up -d --build
	POSTGRES_USER=test POSTGRES_PASSWORD=test ./scripts/wait-for-postgres.sh localhost 15432 test
	./scripts/wait-for-webservice.sh http://localhost:8080/hapi
	docker-compose -f $(docker-compose-e2e) exec -T jpaltime \
		java -jar /app/hapi-fhir-cli.jar upload-definitions -v r4 -t http://localhost:8080/hapi/fhir
	docker-compose -f $(docker-compose-e2e) run river-api migrate

run-e2e-tests:
	$(eval markers := $(skip_markers) $(if $(skip_markers), and) e2e)
	docker-compose -f $(docker-compose-e2e) run --entrypoint pytest river-api tests -m "$(markers)"
