## Troubleshooting

### Test without some tasks

```
pytest -vv -m "not django_db and not kafka and not redis and not pyrog and not pagai"
```
