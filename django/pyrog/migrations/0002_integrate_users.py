# Generated by Django 3.1.2 on 2021-02-04 15:03

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import cuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("pyrog", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="SourceUser",
            fields=[
                ("id", models.TextField(default=cuid.cuid, editable=False, primary_key=True, serialize=False)),
                ("role", models.TextField(choices=[("WRITER", "Writer"), ("READER", "Reader")], default="READER")),
                (
                    "source",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="source_users", to="pyrog.source"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_sources",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("user", "source")},
            },
        ),
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id", models.TextField(default=cuid.cuid, editable=False, primary_key=True, serialize=False)),
                ("content", models.TextField()),
                ("validated", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "attribute",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="pyrog.attribute"
                    ),
                ),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="comments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="source",
            name="users",
            field=models.ManyToManyField(
                related_name="sources", through="pyrog.SourceUser", to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
