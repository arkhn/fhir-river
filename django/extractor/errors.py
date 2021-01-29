class PyrogQueryError(Exception):
    """
    Error used when something went wrong during the query to the pyrog server.
    """

    pass


class ImproperMappingError(Exception):
    """
    Error used when some required information is missing in a mapping.
    """

    pass


class MissingInformationError(Exception):
    """
    Error used when some required information is missing in a mapping.
    """

    pass


class BadRequestError(Exception):
    """
    Error used when the HTTP query is not as expected.
    """

    pass


class EmptyResult(Exception):
    """
    Error used when the query did not return any row.
    """

    pass


class BatchCancelled(Exception):
    """
    Error used when a batch has been cancelled.
    """

    pass
