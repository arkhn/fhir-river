import logging

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from pagai.database_explorer.database_explorer import DatabaseExplorer
from sqlalchemy.exc import OperationalError

# from django.conf import settings

# from extractor.extract import Extractor
# from pagai.api import serializers

logger = logging.getLogger(__name__)


class OwnersViewSet(viewsets.ViewSet):
    @action(methods=["POST"], detail=False, url_path="list", url_name="owners_list")
    def get_owners(self, request):
        credentials = request.data

        try:
            explorer = DatabaseExplorer(credentials)
            db_owners = explorer.get_owners()
        except OperationalError as e:
            if "could not connect to server" in str(e):
                # TODO errors?
                return Response(
                    f"Could not connect to the database: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(db_owners, status=status.HTTP_200_OK)
