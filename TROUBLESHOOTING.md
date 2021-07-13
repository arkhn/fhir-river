## Troubleshooting

### Test without some tasks

First, you have to duplicate `.template.env` file located on the repository root and rename it to `.env`.

```
pytest -vv -m "not django_db and not kafka and not redis and not pyrog and not pagai" [-k pattern_to_script]
```
