import factory
import pytest
from pytest_factoryboy import register

import sqlalchemy
from pagai.database_explorer.database_explorer import SimpleExplorer
from sqlalchemy.ext.declarative import declarative_base
from utils.session import Session

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


def test_explore(engine, session, patient_factory):
    patients = patient_factory.create_batch(3)
    explorer = SimpleExplorer(engine)
    exploration = explorer.list_rows(session, schema="main", table_name="patients", limit=2)

    assert exploration["fields"] == ["id", "name"]
    assert len(exploration["rows"]) == 2
    assert exploration["rows"] == [[patient.id, patient.name] for patient in patients[:2]]


def test_get_owner(engine):
    explorer = SimpleExplorer(engine)
    assert "main" in explorer.list_available_schema()


def test_get_owner_schema(engine):
    explorer = SimpleExplorer(engine)
    db_schema = explorer.get_schema("main")
    assert db_schema == {"main.patients": ["id", "name"]}
