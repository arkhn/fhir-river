# Generated by Django 3.1.8 on 2021-08-25 14:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("river", "0004_batch_completed_canceled"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="error",
            name="deleted_at",
        ),
    ]
