from river.common.service.event import Event


class Handler:
    """Stateful Event handler"""

    def __init__(self) -> None:
        pass

    def __call__(self, event: Event):
        raise NotImplementedError
