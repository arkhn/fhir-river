from django.contrib import admin

from pyrog import models


@admin.register(models.Source)
class Source(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(models.SourceUser)
class SourceUser(admin.ModelAdmin):
    list_display = ("id", "source", "user", "role")


@admin.register(models.Resource)
class Resource(admin.ModelAdmin):
    pass


@admin.register(models.Credential)
class Credential(admin.ModelAdmin):
    pass


@admin.register(models.Attribute)
class Attribute(admin.ModelAdmin):
    pass


@admin.register(models.Comment)
class Comment(admin.ModelAdmin):
    pass


@admin.register(models.InputGroup)
class InputGroup(admin.ModelAdmin):
    pass


@admin.register(models.StaticInput)
class StaticInput(admin.ModelAdmin):
    pass


@admin.register(models.SQLInput)
class SQLInput(admin.ModelAdmin):
    pass


@admin.register(models.Column)
class Column(admin.ModelAdmin):
    pass


@admin.register(models.Join)
class Join(admin.ModelAdmin):
    pass


@admin.register(models.Condition)
class Condition(admin.ModelAdmin):
    pass


@admin.register(models.Filter)
class Filter(admin.ModelAdmin):
    pass


@admin.register(models.Owner)
class Owner(admin.ModelAdmin):
    pass
