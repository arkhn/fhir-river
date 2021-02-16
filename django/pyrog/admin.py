from django.contrib import admin

from pyrog import models


@admin.register(models.Source)
class Source(admin.ModelAdmin):
    list_display = ("id", "name")
