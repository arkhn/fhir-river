include .env
docker-compose-e2e = ./docker-compose.e2e.yml

e2e: setup-e2e run-e2e

setup-e2e:
	docker-compose -f $(docker-compose-e2e) up -d
	./scripts/wait-for-postgres.sh localhost 15432 test
	docker-compose -f $(docker-compose-e2e) exec -T jpaltime \
		java -jar /app/hapi-fhir-cli.jar upload-definitions -v r4 -t http://localhost:8080/fhir

run-e2e:
	docker-compose -f $(docker-compose-e2e) exec -T river-api pytest tests -m "e2e"
