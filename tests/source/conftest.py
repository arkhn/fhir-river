import pytest

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker


@pytest.fixture(scope="session")
def session_factory():
    return scoped_session(sessionmaker())


@pytest.fixture(scope="session")
def engine(session_factory):
    engine = create_engine("sqlite://")
    # Configure the session factory
    session_factory.configure(bind=engine)
    return engine


@pytest.fixture
def session(session_factory, engine):
    s = session_factory()
    yield s
    s.rollback()
    session_factory.remove()


@pytest.fixture
def base(engine):
    Base = declarative_base(bind=engine)
    return Base
