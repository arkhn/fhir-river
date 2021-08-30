from django.db import models

from cuid import cuid
from pyrog import models as pyrog_models


class Batch(models.Model):
    id = models.TextField(primary_key=True, default=cuid, editable=False)
    mappings = models.JSONField(default=None, null=True)
    resource_ids = models.ManyToManyField(pyrog_models.Resource)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    canceled_at = models.DateTimeField(null=True, editable=False)
    completed_at = models.DateTimeField(null=True, editable=False)


class Error(models.Model):
    id = models.TextField(primary_key=True, default=cuid, editable=False)
    batch = models.ForeignKey(Batch, related_name="errors", on_delete=models.CASCADE)
    event = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
