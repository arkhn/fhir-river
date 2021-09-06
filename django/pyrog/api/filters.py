from django_filters import rest_framework as filters
from pyrog import models


class CredentialFilterSet(filters.FilterSet):
    class Meta:
        model = models.Credential
        fields = ["source"]


class ColumnFilterSet(filters.FilterSet):
    class Meta:
        model = models.Column
        fields = ["join", "input"]


class JoinFilterSet(filters.FilterSet):
    class Meta:
        model = models.Join
        fields = ["column"]


class FilterFilterSet(filters.FilterSet):
    class Meta:
        model = models.Filter
        fields = ["resource"]


class OwnerFilterSet(filters.FilterSet):
    class Meta:
        model = models.Owner
        fields = ["credential"]


class ResourceFilterSet(filters.FilterSet):
    class Meta:
        model = models.Resource
        fields = ["source"]


class AttributeFilterSet(filters.FilterSet):
    source = filters.ModelChoiceFilter("resource__source", queryset=models.Source.objects.all())

    class Meta:
        model = models.Attribute
        fields = ["resource", "source", "path"]


class InputGroupFilterSet(filters.FilterSet):
    class Meta:
        model = models.InputGroup
        fields = ["attribute"]


class InputFilterSet(filters.FilterSet):
    class Meta:
        model = models.Input
        fields = ["input_group"]


class ConditionFilterSet(filters.FilterSet):
    class Meta:
        model = models.Condition
        fields = ["input_group"]
