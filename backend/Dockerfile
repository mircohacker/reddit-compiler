FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-alpine3.10

# Build and install lxml and remove build deps afterwards
RUN apk add --no-cache --virtual .build-deps gcc libc-dev libxslt-dev && \
    apk add --no-cache libxslt && \
    apk add --no-cache jq && \
    pip install --no-cache-dir lxml>=3.5.0 && \
    apk del .build-deps

# install all dependencies from Pipfile.lock with pip (without using pipenv at all inside the container
COPY ./Pipfile.lock /app/Pipfile.lock
RUN sh -c "jq -r '.default | to_entries[] | .key + .value.version' Pipfile.lock  > requirements.txt ; pip install -r requirements.txt"

COPY ./app/main.py /app/main.py