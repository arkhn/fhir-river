from django.db import migrations, models

import cuid


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0006_related_names"),
    ]

    operations = [
        migrations.AlterField(
            model_name="resource",
            name="logical_reference",
            field=models.TextField(default=cuid.cuid, editable=False),
        ),
    ]
