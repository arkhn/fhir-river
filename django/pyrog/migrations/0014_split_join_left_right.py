# Generated by Django 3.1.12 on 2021-09-02 13:30

import django.db.models.deletion
from django.db import migrations, models


def forwards_func(apps, schema_editor):
    Join = apps.get_model("pyrog", "Join")
    SQLInput = apps.get_model("pyrog", "SQLInput")

    for join in Join.objects.all():
        print(join.id)
        columns = join.columns.all().order_by("created_at")
        join.left = columns[0]
        join.right = columns[1]
        sql_input = SQLInput.objects.get(column=join.column)
        join.sql_input = sql_input
        join.save()


def reverse_func(apps, schema_editor):
    Join = apps.get_model("pyrog", "Join")
    Column = apps.get_model("pyrog", "Column")

    for join in Join.objects.all():
        left_col = join.left
        left_col.join = join
        left_col.save()
        right_col = join.right
        right_col.join = join
        right_col.save()

        column = Column.objects.get(sql_input=join.sql_input)
        join.column = column
        join.save()


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0013_conditions_and_filters_sqlinput"),
    ]

    operations = [
        migrations.AddField(
            model_name="join",
            name="left",
            field=models.ForeignKey(
                default=None,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="joined_left",
                to="pyrog.column",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="join",
            name="right",
            field=models.ForeignKey(
                default=None,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="joined_right",
                to="pyrog.column",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="join",
            name="sql_input",
            field=models.ForeignKey(
                default=None,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="joins",
                to="pyrog.sqlinput",
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="join",
            name="column",
            field=models.ForeignKey(null=True, on_delete=models.CASCADE, related_name="joins", to="pyrog.column"),
        ),
        migrations.RunPython(forwards_func, reverse_func),
        migrations.AlterField(
            model_name="join",
            name="left",
            field=models.ForeignKey(
                null=False, on_delete=django.db.models.deletion.CASCADE, related_name="joined_left", to="pyrog.column"
            ),
        ),
        migrations.AlterField(
            model_name="join",
            name="right",
            field=models.ForeignKey(
                null=False, on_delete=django.db.models.deletion.CASCADE, related_name="joined_right", to="pyrog.column"
            ),
        ),
        migrations.AlterField(
            model_name="join",
            name="sql_input",
            field=models.ForeignKey(
                null=False, on_delete=django.db.models.deletion.CASCADE, related_name="joins", to="pyrog.sqlinput"
            ),
        ),
        migrations.RemoveField(
            model_name="column",
            name="join",
        ),
        migrations.RemoveField(
            model_name="join",
            name="column",
        ),
    ]
