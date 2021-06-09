from django.conf import settings

from common import batch_types

# Set default configuration for topicleaner


class Settings:
    @property
    def CONSUMER_GROUP_ID(self):
        return getattr(settings, "CONSUMER_GROUP_ID", "topicleaner")

    @property
    def CONSUMED_TOPICS(self):
        return getattr(settings, "CONSUMED_TOPICS", f"^load\\.{batch_types.BATCH}\\..*")


conf = Settings()
