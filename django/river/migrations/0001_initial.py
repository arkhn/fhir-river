# Generated by Django 3.1.8 on 2021-06-15 13:57

import django.db.models.deletion
from django.contrib.postgres import fields
from django.db import migrations, models

import cuid


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Batch",
            fields=[
                ("id", models.TextField(default=cuid.cuid, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("deleted_at", models.DateTimeField(editable=False, null=True)),
                ("resources", fields.ArrayField(models.TextField(), size=None, default=list)),
            ],
        ),
        migrations.CreateModel(
            name="Error",
            fields=[
                ("id", models.TextField(default=cuid.cuid, editable=False, primary_key=True, serialize=False)),
                ("event", models.TextField()),
                ("message", models.TextField()),
                ("exception", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("deleted_at", models.DateTimeField(editable=False, null=True)),
                (
                    "batch",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="errors", to="river.batch"
                    ),
                ),
            ],
        ),
    ]
