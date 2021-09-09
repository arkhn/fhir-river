# Generated by Django 3.1.8 on 2021-08-25 13:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("river", "0003_batch_resource_ids"),
    ]

    operations = [
        migrations.RenameField(
            model_name="batch",
            old_name="deleted_at",
            new_name="completed_at",
        ),
        migrations.AddField(
            model_name="batch",
            name="canceled_at",
            field=models.DateTimeField(editable=False, null=True),
        ),
    ]