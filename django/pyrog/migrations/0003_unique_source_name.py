# Generated by Django 3.1.2 on 2021-02-11 11:02

from django.db import migrations


def update_source_name(apps, schema_editor):
    Source = apps.get_model("pyrog", "Source")

    for source in Source.objects.all():
        source.name = f"{source.template.name} - {source.name}"
        source.save(update_fields=["name"])


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0002_integrate_users"),
    ]

    operations = [migrations.RunPython(update_source_name, reverse_code=migrations.RunPython.noop)]