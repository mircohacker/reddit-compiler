FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-alpine3.10

RUN wget 'https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py' && python get-poetry.py

COPY ./pyproject.toml ./poetry.lock /app/

# Install build dependencies for lxml, then install app dependenies and remove build deps afterwards
# This makes the image smaller but also makes for longer builds
RUN apk add --no-cache --virtual .build-deps gcc libc-dev libxslt-dev && \
    apk add --no-cache libxslt && \
    apk add --no-cache jq && \
    /root/.poetry/bin/poetry export -o requirements.txt && pip install -r requirements.txt && \
    apk del .build-deps

# install all dependencies from Pipfile.lock with pip (without using pipenv at all inside the container

COPY ./app/main.py /app/main.py