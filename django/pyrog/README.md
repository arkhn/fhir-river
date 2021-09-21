# Pyrog application

## How to "upgrade" an exported mapping

When pyrog's data model is changed, the exported mappings need to be changed accordingly 
(especially the ones used in this repo for the tests).
The way we do this is by importing the mappings at a certain version, migrating the data in the DB and exporting it again
as a new mapping.

The tricky part is that you will have to `git checkout` the import/export part of the code during this manipulation.
Here is what it can look like:

```
git checkout <commit of the old migration>
python django/manage.py import_mappings --mappings <mapping path> --settings settings.sqlite
git checkout <your code>
python django/manage.py export_mappings --dest <an output folder> --settings settings.sqlite
```
