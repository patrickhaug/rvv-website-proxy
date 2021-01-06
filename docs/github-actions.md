# Github Actions - Settings

## Required Secrets

### Check Workflow

#### Repository Level Secrets

### Preview Workflow
- `GATSBY_TWITTER_HANDLE` - Twitter username to be used in the meta content. Eg: '@roche_de'

#### Repository Level Secrets

- `PREVIEW_STATIC_WEB_SITE_BUCKET` - The S3 bucket name where the static website is deployed for preview environment.
- `PREVIEW_CLOUDFRONT_DISTRIBUTION_ID` - The AWS Cloudfront distribution ID for preview environment.
- `PREVIEW_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for unpublished/draft content. Example: 'preview'.
- `PREVIEW_STAGING_AWS_S3_BUCKET` - The S3 bucket name for the preview staging environment.
- `PREVIEW_STAGING_DISTRIBUTION` - The AWS  distribution ID for preview staging environment.
- `STAGING_STORYBLOK_SPACE_ID` - The id of the Space in Storyblok. Example: 85566
- `STAGING_STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'roche-website-starter'.
- `PREVIEW_STAGING_WEBSITE_URL` - The final URL of the website for preview/staging. Example: `https://preview.roche-website-starter-staging.roche-infra.com`
- `PREVIEW_WEBSITE_URL` - The final URL of the website for preview/prod. Example: `https://preview.roche-website-starter.roche-infra.com`
- `CLUDO_ENGINE_LIST` - List of cludo engine ids for this website, 1 engine per language. Example: 'pt:123412, en:1233244'

### Live Workflow
- `GATSBY_TWITTER_HANDLE` - Twitter username to be used in the meta content. Eg: '@roche_de'

#### Repository Level Secrets

- `LIVE_STATIC_WEB_SITE_BUCKET` - The S3 bucket name where the static website is deployed for live environment.
- `LIVE_CLOUDFRONT_DISTRIBUTION_ID` - The AWS Cloudfront distribution ID for live environment.
- `LIVE_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for published content. Example: 'live'.
- `LIVE_STAGING_AWS_S3_BUCKET` - The S3 bucket name for the live staging environment.
- `LIVE_STAGING_DISTRIBUTION` - The AWS  distribution ID for live staging environment.
- `LIVE_STAGING_WEBSITE_URL` - The final URL of the website for live/staging. Example: `https://live.roche-website-starter-staging.roche-infra.com` or `staging.www.roche.hs`.
- `LIVE_WEBSITE_URL` - The final URL of the website for live/prod. Example: `https://live.roche-website-starter.roche-infra.com` or `www.roche.hs`
- `STORYBLOK_SPACE_ID` - The id of the Space in Storyblok. Example: 85566
- `STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'roche-website-starter'
- `ROCHE_ONETRUST_KEY` - The value of Onetrust's cookie consent token. Example: '8831b9b2-8a91-ddd-test'.
- `ROCHE_GOOGLE_TAG_MANAGER_ID` - The id from the Google Tag Manager account.
- `CLUDO_ENGINE_LIST` - List of cludo engine ids for this website, 1 engine per language. Example: 'pt:123412, en:1233244'

### Organization Level Secrets Shared between projects and workflows

- `ROCHE_AWS_ACCESS_KEY_ID` - The AWS Access Key ID used to deploy the infrastructure.
- `ROCHE_AWS_SECRET_ACCESS_KEY` - The AWS Secret Access Key used to deploy the infrastructure.
- `ROCHE_AWS_DEFAULT_REGION` - The AWS Default regions where the infrastructure is deployed.
- `ROCHE_COMPONENTS_LIBRARY_URL` - The URL of Roche components library version used by the website. Example: `http://live.roche-components-library.roche-infra.com/releases/latest`
- `ROCHE_GOOGLE_RECAPTCHA_SITE_KEY` - The Google Recaptcha Site Key used to generate Google Recaptcha Validation tokens. Example: `xshso0sdfahdlsd0f`
- `ROCHE_WEBHOOKS_API_URL` - The URL of Roche Webhooks API responsible for processing website related events. Example: `https://staging.apis.roche-infra.com/webhooks`
- `ROCHE_BRIGHTCOVE_ACCOUNT_ID`- The account ID for the Brightcove account
- `ROCHE_BRIGHTCOVE_PLAYER_ID`- The player ID for the Brightcove acccount
- `CLUDO_CUSTOMER_ID` - customer id for the cludo account. Example: '12345'

## Workflows

- Check - Verify quality requirements before enabling merge to master
- Preview - Deploy the `preview` website version used by Editor with unplublished content.
- Release - Deploy the `live` website version used by customers with plublished content.

This project follows the GitFlow.

staging > deploys staging
master  > deploys preview/live
