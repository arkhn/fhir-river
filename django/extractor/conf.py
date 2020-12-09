from django.conf import settings


# Extractor-only settings

class Settings:
    @property
    def CONSUMER_GROUP_ID(self):
        return getattr(settings, "CONSUMER_GROUP_ID", "extractor")

    @property
    def EXTRACT_TOPIC(self):
        return getattr(settings, "EXTRACT_TOPIC", "extract")

    @property
    def BATCH_SIZE_TOPIC(self):
        return getattr(settings, "BATCH_SIZE_TOPIC", "batch_size")

    @property
    def CONSUMED_TOPIC(self):
        return getattr(settings, "CONSUMED_TOPIC", "batch")

conf = Settings()