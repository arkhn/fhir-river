from django_filters import rest_framework as filters
from pyrog import models as pyrog_models
from river import models


class BatchFilterSet(filters.FilterSet):
    source = filters.ModelMultipleChoiceFilter("resources__source", queryset=pyrog_models.Source.objects.all())

    class Meta:
        model = models.Batch
        fields = ["source"]
