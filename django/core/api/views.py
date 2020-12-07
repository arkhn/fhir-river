from rest_framework import views, viewsets
from rest_framework.response import Response

from django.conf import settings

# Create your API views here


class VersionEndpoint(views.APIView):
    def get(self, request):
        """
        Return the version of the application
        """
        data = {"commit": settings.VERSION_SHA, "version": settings.VERSION_NAME}
        return Response(data)