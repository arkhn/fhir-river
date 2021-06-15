import uuid


class Event:
    def __init__(self, data: dict) -> None:
        self.id = uuid.uuid4()
        self.data = data
