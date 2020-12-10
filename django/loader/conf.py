from django.conf import settings


# Set default configuration for loader


class Settings:
    @property
    def CONSUMER_GROUP_ID(self):
        return getattr(settings, "CONSUMER_GROUP_ID", "loader")

    @property
    def CONSUMED_TOPICS(self):
        return getattr(settings, "CONSUMED_TOPICS", "^transform\\..*")

    @property
    def PRODUCED_TOPIC_PREFIX(self):
        return getattr(settings, "PRODUCED_TOPIC_PREFIX", "load.")


conf = Settings()