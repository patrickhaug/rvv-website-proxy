echo "COGNITO_USERPOOL_ID=$(\
  aws cognito-idp \
      list-user-pools --max-results 60 \
                      --output text \
                      --query 'UserPools[*].[Name, Id]' \
  | grep $STORYBLOK_SPACE_NAME-userpool \
  | cut -f2\
)" >> $GITHUB_ENV
