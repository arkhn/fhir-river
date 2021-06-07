import logging
from inspect import getdoc, getmembers, isfunction, ismodule

from rest_framework import status, viewsets
from rest_framework.response import Response

import scripts

logger = logging.getLogger(__name__)


class ScriptsEndpoint(viewsets.ViewSet):
    def list(self, request):
        res = []
        for module_name, module in getmembers(scripts, ismodule):
            for script_name, script in getmembers(module, isfunction):
                doc = getdoc(script)
                res.append({"name": script_name, "description": doc, "category": module_name})
        return Response(res, status=status.HTTP_200_OK)
