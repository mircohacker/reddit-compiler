#!/bin/sh

set -e

if [ -z "$API_GATEWAY_ID" ]; then
  echo "API_GATEWAY_ID env var not set."
  echo "TERMINATING"
  exit 1
else
  echo '***********************************************'
  echo "UPDATING API GATEWAY TO POINT TO THIS CONTAINER"
  echo '***********************************************'

  aws --version

  INTEGRATION=$(aws apigatewayv2 get-integrations --api-id "$API_GATEWAY_ID" | jq -r ' .Items[0].IntegrationId')
  echo "IntegrationId=$INTEGRATION"
  if [ -z "$INTEGRATION" ]; then
    echo "INTEGRATION could not be obtained. Aborting"
    exit 1
  fi

  NEW_IP=$(wget -q http://checkip.amazonaws.com -O -)
  echo "NewIp=$NEW_IP"
  if [ -z "$NEW_IP" ]; then
    echo "NEW_IP could not be obtained. Aborting"
    exit 1
  fi

  echo 'Old integration'
  aws apigatewayv2 get-integration --api-id "$API_GATEWAY_ID" --integration-id "$INTEGRATION"

  echo ''
  echo 'New Integration'
  aws apigatewayv2 update-integration --api-id "$API_GATEWAY_ID" --integration-id "$INTEGRATION" --integration-uri "http://$NEW_IP/"
  sleep infinity
fi