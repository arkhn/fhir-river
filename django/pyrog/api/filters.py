from django_filters import rest_framework as filters
from pyrog import models


class ResourceFilterSet(filters.FilterSet):
    class Meta:
        model = models.Resource
        fields = ["source"]
