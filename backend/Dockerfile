FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-alpine3.10

COPY ./Pipfile.lock /app/Pipfile.lock

# Install build dependencies for lxml, then install app dependenies and remove build deps afterwards
# This makes the image smaller but also makes for longer builds
RUN apk add --no-cache --virtual .build-deps gcc libc-dev libxslt-dev && \
    apk add --no-cache libxslt && \
    apk add --no-cache jq && \
    sh -c "jq -r '.default | to_entries[] | .key + .value.version' Pipfile.lock  > requirements.txt ; pip install -r requirements.txt" && \
    apk del .build-deps

# install all dependencies from Pipfile.lock with pip (without using pipenv at all inside the container

COPY ./app/main.py /app/main.py