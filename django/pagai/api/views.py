from rest_framework import generics, status, views
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema
from pagai.api import serializers
from pagai.database_explorer.database_explorer import DatabaseExplorer
from river.common.analyzer import Analyzer
from river.common.database_connection.db_connection import DBConnection


class OwnersListView(views.APIView):
    def post(self, request):
        serializer = serializers.CredentialsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credentials = serializer.validated_data

        try:
            db_connection = DBConnection(credentials)
            explorer = DatabaseExplorer(db_connection)
            db_owners = explorer.get_owners()
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(db_owners, status=status.HTTP_200_OK)


class OwnerSchemaView(views.APIView):
    def post(self, request, owner):
        serializer = serializers.CredentialsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credentials = serializer.validated_data

        try:
            db_connection = DBConnection(credentials)
            explorer = DatabaseExplorer(db_connection)
            db_schema = explorer.get_owner_schema(owner)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(db_schema, status=status.HTTP_200_OK)


@extend_schema(
    request=serializers.ExplorationRequestSerializer, responses={"200": serializers.ExplorationResponseSerializer}
)
class ExploreView(generics.CreateAPIView):
    def create(self, request, *args, **kwargs):
        serializer = serializers.ExplorationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        headers = self.get_success_headers(serializer.data)

        data = serializer.validated_data
        limit = int(request.GET.get("first", 10))

        analyzer = Analyzer()
        analysis = analyzer.analyze(data["mapping"])

        credentials = analysis.source_credentials

        try:
            db_connection = DBConnection(credentials)
            explorer = DatabaseExplorer(db_connection)
            exploration = explorer.explore(data["owner"], data["table"], limit=limit, filters=analysis.filters)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR, headers=headers)

        return Response(exploration, status=status.HTTP_200_OK, headers=headers)
