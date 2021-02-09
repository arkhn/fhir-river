from pytest_factoryboy import register

from . import factories

register(factories.SourceFactory)
register(factories.ResourceFactory)
register(factories.CredentialFactory)
register(factories.AttributeFactory)
register(factories.InputGroupFactory)
register(factories.InputFactory)
register(factories.ColumnFactory)
register(factories.ColumnFactory, "column_with_join", with_join=True)
register(factories.JoinFactory)
register(factories.OwnerFactory)
