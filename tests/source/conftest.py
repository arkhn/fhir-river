import pytest

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import DeclarativeMeta


@pytest.fixture(scope="session")
def engine():
    from .session import Session

    engine = create_engine("sqlite://")
    # Configure the session factory
    Session.configure(bind=engine)
    return engine


@pytest.fixture
def session(engine):
    from .session import Session

    s = Session()
    yield s
    s.rollback()
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
