from django.conf import settings

# Set default configuration for topicleaner


class Settings:
    @property
    def CONSUMER_GROUP_ID(self):
        return getattr(settings, "CONSUMER_GROUP_ID", "topicleaner")

    @property
    def CONSUMED_TOPICS(self):
        return getattr(settings, "CONSUMED_TOPICS", "^load\\..*")


conf = Settings()
