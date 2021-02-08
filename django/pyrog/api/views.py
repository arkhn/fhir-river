from django.contrib import auth
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from pyrog import models
from pyrog.api import serializers


class Session(APIView):
    def delete(self, request):
        if request.user.is_authenticated:
            auth.logout(request)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)


class SourceViewSet(viewsets.ModelViewSet):
    queryset = models.Source.objects.all()
    serializer_class = serializers.SourceSerializer
