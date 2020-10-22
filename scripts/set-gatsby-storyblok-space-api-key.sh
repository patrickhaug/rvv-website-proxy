echo "GATSBY_STORYBLOK_SPACE_API_KEY=$(\
  aws secretsmanager \
      get-secret-value --secret-id $STORYBLOK_SPACE_NAME-secret \
      | jq '.SecretString | fromjson' \
      | jq '."'${STORYBLOK_SPACE_NAME}.apikeys.${STORYBLOK_API_KEY_NAME}'"' -r)" >> $GITHUB_ENV
