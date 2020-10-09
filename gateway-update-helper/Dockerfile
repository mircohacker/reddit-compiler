FROM python:alpine

RUN \
    apk add --no-cache jq && \
    pip install awscli && \
    aws --version

COPY update-gw.sh /update-gw.sh

CMD sh /update-gw.sh