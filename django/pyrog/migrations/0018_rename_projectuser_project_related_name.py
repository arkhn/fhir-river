# Generated by Django 3.1.13 on 2021-10-13 14:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pyrog', '0017_rename_source_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectuser',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_users', to='pyrog.project'),
        ),
    ]
