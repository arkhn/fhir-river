import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pyrog", "0005_input_static_value_nullable"),
    ]

    operations = [
        migrations.AlterField(
            model_name="column",
            name="owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, related_name="columns", to="pyrog.owner"
            ),
        ),
        migrations.AlterField(
            model_name="condition",
            name="input_group",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, related_name="conditions", to="pyrog.inputgroup"
            ),
        ),
        migrations.AlterField(
            model_name="owner",
            name="credential",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, related_name="owners", to="pyrog.credential"
            ),
        ),
    ]
