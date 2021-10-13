from django_filters import rest_framework as filters
from pyrog import models as pyrog_models
from river import models


class BatchFilterSet(filters.FilterSet):
    """BatchFilterSet filters a list of batches by sources of their resources"""

    project = filters.ModelMultipleChoiceFilter("resources__project", queryset=pyrog_models.Project.objects.all())

    class Meta:
        model = models.Batch
        fields = ["project"]
