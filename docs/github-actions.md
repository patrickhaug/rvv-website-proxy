# Github Actions - Settings

## Constants

- `CACHE_ID` - Contains the id of Gatsby cache for conditional builds for each workflow. In case of needing to perform a full website rebuild. Just update the cache version +1.

## Required Secrets

### Check Workflow

#### Repository Level Secrets

- `LIVE_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for published content. Example: 'live'
- `STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'roche-website-starter'

### Preview Workflow

#### Repository Level Secrets

- `PREVIEW_STATIC_WEB_SITE_BUCKET` - The S3 bucket name where the static website is deployed for preview environment.
- `PREVIEW_CLOUDFRONT_DISTRIBUTION_ID` - The AWS Cloudfront distribution ID for preview environment
- `PREVIEW_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for unpublished/draft content. Example: 'preview'
- `STORYBLOK_SPACE_ID` - The id of the Space in Storyblok. Example: 85566
- `STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'roche-website-starter'

### Live Workflow

#### Repository Level Secrets

- `LIVE_STATIC_WEB_SITE_BUCKET` - The S3 bucket name where the static website is deployed for live environment.
- `LIVE_CLOUDFRONT_DISTRIBUTION_ID` - The AWS Cloudfront distribution ID for live environment
- `LIVE_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for published content. Example: 'live'
- `STORYBLOK_SPACE_ID` - The id of the Space in Storyblok. Example: 85566
- `STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'roche-website-starter'

### Organization Level Secrets Shared between projects and workflows

- `ROCHE_AWS_ACCESS_KEY_ID` - The AWS Access Key ID used to deploy the infrastructure.
- `ROCHE_AWS_SECRET_ACCESS_KEY` - The AWS Secret Access Key used to deploy the infrastructure.
- `ROCHE_AWS_DEFAULT_REGION` - The AWS Default regions where the infrastructure is deployed.
- `ROCHE_COMPONENTS_LIBRARY_URL` - The URL of Roche components library version used by the website. Example: `http://live.roche-components-library.roche-infra.com/releases/latest`
- `ROCHE_GOOGLE_RECAPTCHA_SITE_KEY` - The Google Recaptcha Site Key used to generate Google Recaptcha Validation tokens. Example: `xshso0sdfahdlsd0f`
- `ROCHE_WEBHOOKS_API_URL` - The URL of Roche Webhooks API responsible for processing website related events. Example: `https://staging.apis.roche-infra.com/webhooks`
-`ROCHE_BRIGHTCOVE_ACCOUNT_ID`- The account ID for the Brightcove account
-`ROCHE_BRIGHTCOVE_PLAYER_ID`- The player ID for the Brightcove acccount

## Workflows

- Check - Verify quality requirements before enabling merge to master
- Preview - Deploy the `preview` website version used by Editor with unplublished content.
- Release - Deploy the `live` website version used by customers with plublished content.

This project follows the GitFlow.

staging > deploys staging
master  > deploys preview/live


