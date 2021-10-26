# Generated by Django 3.1.13 on 2021-10-26 09:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0014_split_join_left_right"),
    ]

    operations = [
        migrations.AlterField(
            model_name="column",
            name="owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT, related_name="columns", to="pyrog.owner"
            ),
        ),
        migrations.AlterField(
            model_name="resource",
            name="primary_key_owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT, related_name="resources", to="pyrog.owner"
            ),
        ),
    ]
