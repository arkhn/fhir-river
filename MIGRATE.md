# FROM 3.X.X to 5.X.X

```shell
 # remove all river services
 docker stack rm fhir-river

 # remove river database
 docker exec -ti `docker ps -q -f "name=postgres"` psql -U prisma -d prisma -c "drop database river;"
 docker exec -ti `docker ps -q -f "name=postgres"` psql -U prisma -d prisma -c "drop user river;"

 # comment task "Migrate river db" in stack/roles/fhir-river/tasks/setup_db.yml

 # redeploy river
 make river

 # copy the pyrog schema to the river database
 docker exec -ti `docker ps -q -f "name=postgres"`  pg_dump -U prisma -d prisma -n pyrog --format=c -f pyrog_dump
 docker exec -ti `docker ps -q -f "name=postgres"`  pg_restore -U prisma -d river pyrog_dump

 # grant access to pyrog schema to river_postgres_user
 docker exec -ti `docker ps -q -f "name=postgres"`  psql -U prisma -d river -c "grant all on schema pyrog to river;"
 docker exec -ti `docker ps -q -f "name=postgres"`  psql -U prisma -d river -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pyrog to river;"

 # run river migration until pyrog 0002
 docker exec -ti `docker ps -q -f "name=river-api"` python django/manage.py migrate pyrog 0002

 # run the SQL migration script inside the river-api container:
 docker exec -ti `docker ps -q -f "name=river-api"` /bin/bash
 PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -d $POSTGRES_DB -U $POSTGRES_USER -f /srv/django/pyrog/migrations/migrate.sql

 # run all river migrations
 docker exec -ti `docker ps -q -f "name=river-api"` python django/manage.py migrate

 # fhir-api is up and running and has all the required definitions (standard and custom profiles...)

 # update attributes paths
 # Old pyrog attributes paths lack resource_type prefixes and new pyrog needs them
 # Example: attribute.path === "id" becomes attribute.path === "Patient.id"
 docker exec -ti `docker ps -q -f "name=river-api"` python django/manage.py update_attr_paths
```
