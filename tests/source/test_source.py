import pytest

import sqlalchemy


@pytest.fixture
def patient_model(base):
    Patient = type(
        "Patient",
        (base,),
        dict(
            __tablename__="patients",
            id=sqlalchemy.Column(sqlalchemy.Integer, primary_key=True),
            name=sqlalchemy.Column(sqlalchemy.String),
        ),
    )
    return Patient


@pytest.fixture
def create_tables(base, patient_model):
    """Create tables from declared models.

    Any desired model fixture should be requested, so that create_tables
    will be called after model fixture in the instantiation order.
    """
    base.metadata.create_all()


@pytest.fixture
def patient(create_tables, patient_model, patient_name):
    return patient_model(name=patient_name)


@pytest.mark.parametrize("patient_name", ["johny"])
def test_foo(session, patient, patient_model):
    session.add(patient)
    assert len(session.query(patient_model).all()) == 1
