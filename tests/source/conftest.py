import pytest

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import DeclarativeMeta
from utils.session import Session


@pytest.fixture(scope="session")
def engine():
    return create_engine("sqlite://")


@pytest.fixture(autouse=True)
def external_transaction(request, engine):
    """Create a transaction to be joined by sessions."""

    connection = engine.connect()
    transaction = connection.begin()
    Session.configure(bind=connection)
    yield transaction
    transaction.rollback()
    connection.close()


@pytest.fixture
def session(request):
    s = Session()
    yield s
    s.close()
    Session.remove()


@pytest.fixture(scope="module", autouse=True)
def _create_table(request, engine):
    """Create tables automatically.

    This fixture introspects the current test module for a declarative base
    class named `Base` and if there is one, creates the associated tables.
    """
    Base = getattr(request.module, "Base", None)
    if Base and isinstance(Base, DeclarativeMeta):
        Base.metadata.create_all(bind=engine)
