import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0006_related_names"),
    ]

    operations = [
        migrations.AlterField(
            model_name="resource",
            name="logical_reference",
            field=models.UUIDField(default=uuid.uuid4, editable=False),
        ),
    ]
