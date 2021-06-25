from django.conf import settings

# Set default configuration for extractor


class Settings:
    @property
    def CONSUMER_GROUP_ID(self):
        return getattr(settings, "CONSUMER_GROUP_ID", "extractor")

    @property
    def PRODUCED_TOPIC_PREFIX(self):
        return getattr(settings, "PRODUCED_TOPIC_PREFIX", "extract.")

    @property
    def MAX_POLL_INTERVAL_MS(self):
        return getattr(settings, "MAX_POLL_INTERVAL_MS", 900_000)


conf = Settings()
