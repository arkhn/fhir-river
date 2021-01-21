from django.conf import settings

# Set default configuration for transformer


class Settings:
    @property
    def CONSUMER_GROUP_ID(self):
        return getattr(settings, "CONSUMER_GROUP_ID", "transformer")

    @property
    def CONSUMED_TOPICS(self):
        return getattr(settings, "CONSUMED_TOPICS", "^extract\\..*")

    @property
    def PRODUCED_TOPIC_PREFIX(self):
        return getattr(settings, "PRODUCED_TOPIC_PREFIX", "transform.")


conf = Settings()
