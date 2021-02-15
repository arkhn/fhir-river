import factory
import pytest
from pytest_factoryboy import register

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base

from .session import Session

Base = declarative_base()


class Patient(Base):
    __tablename__ = "patients"

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String)


class PatientFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Patient
        sqlalchemy_session = Session

    name = factory.Sequence(lambda n: f"patient_{n}")


register(PatientFactory)


@pytest.mark.parametrize("patient__name", ["foo"])
def test_foo(session, patient):
    assert patient.name == "foo"
    assert len(session.query(Patient).all()) == 1
