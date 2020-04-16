import os


def get_db_url():
    """
    Get DB URL to create db engine
    :return:
    """
    db_url = "postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}".format(
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        database=os.getenv("POSTGRES_DB"),
    )

    return db_url
