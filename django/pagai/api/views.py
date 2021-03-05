from rest_framework import status, views
from rest_framework.response import Response

from common.analyzer import Analyzer
from common.database_connection.db_connection import create_engine
from common.mapping.fetch_mapping import fetch_resource_with_filters
from pagai.api.serializers import CredentialsSerializer
from pagai.database_explorer.database_explorer import DatabaseExplorer


class OwnersListView(views.APIView):
    def post(self, request):
        serializer = CredentialsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credentials = serializer.validated_data

        try:
            engine = create_engine(**credentials)
            explorer = DatabaseExplorer(engine)
            db_owners = explorer.get_owners()
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(db_owners, status=status.HTTP_200_OK)


class OwnerSchemaView(views.APIView):
    def post(self, request, owner):
        serializer = CredentialsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credentials = serializer.validated_data

        try:
            engine = create_engine(**credentials)
            explorer = DatabaseExplorer(engine)
            db_schema = explorer.get_owner_schema(owner)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(db_schema, status=status.HTTP_200_OK)


class ExploreView(views.APIView):
    def get(self, request, resource_id, owner, table):
        limit = int(request.GET.get("first", 10))

        # Get authorization header
        authorization_header = request.META.get("HTTP_AUTHORIZATION")

        resource_mapping = fetch_resource_with_filters(resource_id, authorization_header)

        analyzer = Analyzer()
        analysis = analyzer.analyze(resource_mapping)

        credentials = analysis.source_credentials

        try:
            engine = create_engine(**credentials)
            explorer = DatabaseExplorer(engine)
            exploration = explorer.explore(owner, table, limit=limit, filters=analysis.filters)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(exploration, status=status.HTTP_200_OK)
