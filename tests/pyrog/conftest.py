from pytest_factoryboy import register

from . import factories

register(factories.TemplateFactory)
register(factories.SourceFactory)
