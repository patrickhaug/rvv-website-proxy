curl -X POST \
  "${ROCHE_WEBHOOKS_API_URL}/v1/storyblok-event-notifications" \
  -H 'Content-Type: application/json' \
  -d "{\"action\":\"live_deploy_finished\", \"space_id\": ${STORYBLOK_SPACE_ID} }"
