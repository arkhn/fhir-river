from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0007_logical_reference_default"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="column",
            options={"ordering": ["updated_at"]},
        ),
    ]
