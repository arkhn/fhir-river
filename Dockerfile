########
# This image compile the dependencies
########
FROM arkhn/python-db-drivers:0.3.0 as compile-image

ENV VIRTUAL_ENV /srv/venv
ENV PATH "${VIRTUAL_ENV}/bin:${PATH}"
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /srv

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
    binutils \
    build-essential \
    libpq-dev \
    # git is unfortunately required for company packages
    # that have not been published on pypi (yet)
    git \
    && apt-get autoremove --purge -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv ${VIRTUAL_ENV}

COPY requirements requirements
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements/prod.txt
RUN pip install --no-cache-dir -r requirements/tests.txt


########
# This image is the runtime
########
FROM arkhn/python-db-drivers:0.3.0 as runtime-image

ARG VERSION_SHA
ARG VERSION_NAME
ENV VERSION_SHA $VERSION_SHA
ENV VERSION_NAME $VERSION_NAME

ENV VIRTUAL_ENV /srv/venv
ENV PATH "${VIRTUAL_ENV}/bin:${PATH}"
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /srv

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
    curl libpq-dev \
    && apt-get autoremove --purge -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd uwsgi
RUN useradd --no-log-init -g uwsgi uwsgi

# Copy venv with compiled dependencies
COPY --chown=uwsgi:uwsgi --from=compile-image /srv/venv /srv/venv

COPY --chown=uwsgi:uwsgi ["pyproject.toml", "docker-entrypoint.sh", "uwsgi.ini", "/srv/"]
COPY --chown=uwsgi:uwsgi django /srv/django
COPY --chown=uwsgi:uwsgi tests /srv/tests
COPY --chown=uwsgi:uwsgi tox.ini /srv/tox.ini
RUN chmod +x docker-entrypoint.sh

ENV FILES_ROOT /var/www
RUN mkdir -p "${FILES_ROOT}"
RUN chown uwsgi:uwsgi "${FILES_ROOT}"

USER uwsgi
EXPOSE 8000

ENTRYPOINT ["/srv/docker-entrypoint.sh"]