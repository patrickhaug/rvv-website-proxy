echo "GATSBY_COGNITO_USERPOOL_CLIENT_ID=$(\
  aws cognito-idp \
      list-user-pool-clients \
        --user-pool-id $GATSBY_COGNITO_USERPOOL_ID \
        --output text \
        --query 'UserPoolClients[*].[ClientName, ClientId]' \
  | grep $STORYBLOK_SPACE_NAME-client \
  | cut -f2
)" >> $GITHUB_ENV
