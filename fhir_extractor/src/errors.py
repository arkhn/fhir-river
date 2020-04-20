class PyrogQueryError(Exception):
    """
    Error used when something went wrong during the query to the pyrog server.
    """

    pass


class MissingInformationError(Exception):
    """
    Error used when some required information is missing in a mapping.
    """

    pass
