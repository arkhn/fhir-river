from django.contrib import admin

from river import models


@admin.register(models.Batch)
class Batch(admin.ModelAdmin):
    pass


@admin.register(models.Error)
class Error(admin.ModelAdmin):
    pass
