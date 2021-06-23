# Generated by Django 3.1.8 on 2021-06-23 09:53

from django.db import migrations, models


def update_input_static_value(apps, schema_editor):
    Input = apps.get_model("pyrog", "Input")

    for input_ in Input.objects.all():
        if input_.static_value == "":
            input_.static_value = None
            input_.save(update_fields=["static_value"])


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0004_drop_template"),
    ]

    operations = [
        migrations.AlterField(
            model_name="input",
            name="static_value",
            field=models.TextField(blank=True, default=None, null=True),
        ),
        migrations.RunPython(update_input_static_value, reverse_code=migrations.RunPython.noop),
    ]
