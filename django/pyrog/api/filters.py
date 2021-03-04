from django_filters import rest_framework as filters
from pyrog import models


class ResourceFilterSet(filters.FilterSet):
    class Meta:
        model = models.Resource
        fields = ["source"]


class AttributeFilterSet(filters.FilterSet):
    source = filters.ModelChoiceFilter("resource__source", queryset=models.Source.objects.all())

    class Meta:
        model = models.Attribute
        fields = ["source"]


class OwnerFilterSet(filters.FilterSet):
    source = filters.ModelChoiceFilter("credential__source", queryset=models.Source.objects.all())

    class Meta:
        model = models.Owner
        fields = ["source"]
