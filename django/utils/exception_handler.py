from rest_framework.response import Response
from rest_framework.status import HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Handles exceptions that are not catched by Django

    Args:
        exc (Exception): Exception
        context (Dict): Additional informations about how/where the exception occured.

    Returns:
        Response: Response sent to client containing the value of the exception.
    """
    response = exception_handler(exc, context)

    return Response(
        str(exc),
        status=response.status_code if response is not None else HTTP_500_INTERNAL_SERVER_ERROR,
    )
