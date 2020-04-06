import os
from sqlalchemy import create_engine


def get_db_url():
    """
    Get DB URL to create db engine
    :return:
    """
    db_url = 'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}'.format(
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        database=os.getenv("POSTGRES_DB"))

    return db_url


class DatabaseConfig(object):
    """
    Config object used for poeta database connection
    """

    SQLALCHEMY_DATABASE_URI = get_db_url()
    SQLALCHEMY_POOL_SIZE = 10
    SQLALCHEMY_TRACK_MODIFICATIONS = False


def get_engine_for_conf(config):
    """
    Returns an SQLAlchemy Engine for connecting to databases
    """
    # verifying if `DSC_COMMON` env var is activated [SEE config_common.py file]
    conn_str = config.SQLALCHEMY_DATABASE_URI
    engine = create_engine(conn_str, pool_size=config.SQLALCHEMY_POOL_SIZE)
    return engine
