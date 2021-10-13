from django_filters import rest_framework as filters
from pyrog import models


class CredentialFilterSet(filters.FilterSet):
    class Meta:
        model = models.Credential
        fields = ["project"]


class ColumnFilterSet(filters.FilterSet):
    class Meta:
        model = models.Column
        fields = ["joined_left", "joined_right", "sql_input"]


class JoinFilterSet(filters.FilterSet):
    class Meta:
        model = models.Join
        fields = ["sql_input"]


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
        fields = ["project"]


class AttributeFilterSet(filters.FilterSet):
    project = filters.ModelChoiceFilter("resource__project", queryset=models.Project.objects.all())

    class Meta:
        model = models.Attribute
        fields = ["resource", "project", "path"]


class InputGroupFilterSet(filters.FilterSet):
    class Meta:
        model = models.InputGroup
        fields = ["attribute"]


class StaticInputFilterSet(filters.FilterSet):
    class Meta:
        model = models.StaticInput
        fields = ["input_group"]


class SQLInputFilterSet(filters.FilterSet):
    class Meta:
        model = models.SQLInput
        fields = ["input_group"]


class ConditionFilterSet(filters.FilterSet):
    class Meta:
        model = models.Condition
        fields = ["input_group"]
