set -u : "$STORYBLOK_SPACE_NAME"
#
COGNITO_USERPOOL_ID=$(\
  aws cognito-idp \
      list-user-pools --max-results 60 \
                      --output text \
                      --query 'UserPools[*].[Name, Id]' \
  | grep $STORYBLOK_SPACE_NAME-userpool \
  | cut -f2\
)
#
COGNITO_USERPOOL_CLIENT_ID=$(\
  aws cognito-idp \
      list-user-pool-clients \
        --user-pool-id $COGNITO_USERPOOL_ID \
        --output text \
        --query 'UserPoolClients[*].[ClientName, ClientId]' \
  | grep $STORYBLOK_SPACE_NAME-client \
  | cut -f2
)
