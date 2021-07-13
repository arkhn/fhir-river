## Troubleshooting

### Test without some tasks

Duplicate `.template.env` file and rename it to `.env`.

```
pytest -vv -m "not django_db and not kafka and not redis and not pyrog and not pagai" [-k pattern_to_script]
```
