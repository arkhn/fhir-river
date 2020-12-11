import logging
from rest_framework import status, views
from rest_framework.response import Response


from preview.api.serializers import PreviewSerializer


logger = logging.getLogger(__file__)


class PreviewEndpoint(views.APIView):
    def post(self, request):
        serializer = PreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # TODO(vmttn): do actual preview

        return Response(status=status.HTTP_200_OK)