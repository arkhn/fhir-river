from fluent.handler import FluentRecordFormatter


class FluentFormatter(FluentRecordFormatter):
    def format(self, record):
        """
        Format the record as dict.

        If there is exception information, it is formatted using formatException() and
        added to the data.
        """
        data = super().format(record)

        if record.exc_info:
            data["traceback"] = self.formatException(record.exc_info)

        return data
