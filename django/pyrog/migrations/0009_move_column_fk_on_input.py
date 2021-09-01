# Generated by Django 3.1.12 on 2021-09-01 12:54

import django.db.models.deletion
from django.db import migrations, models


def forwards_func(apps, schema_editor):
    Column = apps.get_model("pyrog", "Column")
    Input = apps.get_model("pyrog", "Input")
    for column in Column.objects.all():
        if column.input_id:
            input = Input.objects.get(id=column.input_id)
            input.column = column
            input.save()


def reverse_func(apps, schema_editor):
    Column = apps.get_model("pyrog", "Column")
    Input = apps.get_model("pyrog", "Input")
    for input in Input.objects.all():
        if input.column_id:
            column = Column.objects.get(id=input.column_id)
            column.input = input
            column.save()


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0008_column_ordering"),
    ]

    operations = [
        migrations.AddField(
            model_name="input",
            name="column",
            field=models.OneToOneField(
                blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to="pyrog.column"
            ),
        ),
        migrations.RunPython(forwards_func, reverse_func),
        migrations.RemoveField(
            model_name="column",
            name="input",
        ),
    ]
