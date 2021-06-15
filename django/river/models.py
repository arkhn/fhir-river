from django.db import models

from cuid import cuid


class Batch(models.Model):
    id = models.TextField(primary_key=True, default=cuid, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, editable=False)
    resources = models.JSONField(blank=True, default=[])


class Error(models.Model):
    id = models.TextField(primary_key=True, default=cuid, editable=False)
    batch = models.ForeignKey(Batch, related_name="errors", on_delete=models.CASCADE)
    event = models.TextField()
    message = models.TextField()
    exception = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, editable=False)
