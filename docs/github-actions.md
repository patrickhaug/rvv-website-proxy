# Github Actions - Settings

## Required Secrets

### Check Workflow

#### Repository Level Secrets
NOTE: since we no longer build the website in github, most of these vars are no longer set as github secrets but stored in the env files in the configuration folder, or automaticly set in the aws secret manager.

### Preview Workflow
- `GATSBY_TWITTER_HANDLE` - Twitter username to be used in the meta content. Eg: '@rcm_de'

#### Repository Level Secrets

- `PREVIEW_STATIC_WEB_SITE_BUCKET` - The S3 bucket name where the static website is deployed for preview environment.
- `PREVIEW_CLOUDFRONT_DISTRIBUTION_ID` - The AWS Cloudfront distribution ID for preview environment.
- `PREVIEW_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for unpublished/draft content. Example: 'preview'.
- `PREVIEW_STAGING_AWS_S3_BUCKET` - The S3 bucket name for the preview staging environment.
- `PREVIEW_STAGING_DISTRIBUTION` - The AWS  distribution ID for preview staging environment.
- `STAGING_STORYBLOK_SPACE_ID` - The id of the Space in Storyblok. Example: 85566
- `STAGING_STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'rcm-corporate'.
- `PREVIEW_STAGING_WEBSITE_URL` - The final URL of the website for preview/staging. Example: `https://preview.rcm-corporate-staging.rcm.frontend.live`
- `PREVIEW_WEBSITE_URL` - The final URL of the website for preview/prod. Example: `https://preview.rcm-corporate.rcm.frontend.live`
- `CLUDO_ENGINE_LIST` - List of cludo engine ids for this website, 1 engine per language. Example: 'pt:123412, en:1233244'
- `GATSBY_WHITE_LISTED_DOMAINS`- Domain names that won't trigger the "On click Notice" component. Example: '["rcm.com"]'```
on-click-notice, Example: '["rcm.com"]'
- `GATSBY_BASE_DOMAIN` - Website domain name. Example: 'rcm'

### Live Workflow
- `GATSBY_TWITTER_HANDLE` - Twitter username to be used in the meta content. Eg: '@rcm_de'

#### Repository Level Secrets

- `LIVE_STATIC_WEB_SITE_BUCKET` - The S3 bucket name where the static website is deployed for live environment.
- `LIVE_CLOUDFRONT_DISTRIBUTION_ID` - The AWS Cloudfront distribution ID for live environment.
- `LIVE_STORYBLOK_API_KEY_NAME` - The name of Storyblok API key for published content. Example: 'live'.
- `LIVE_STAGING_AWS_S3_BUCKET` - The S3 bucket name for the live staging environment.
- `LIVE_STAGING_DISTRIBUTION` - The AWS  distribution ID for live staging environment.
- `LIVE_STAGING_WEBSITE_URL` - The final URL of the website for live/staging. Example: `https://live.rcm-corporate-staging.rcm.frontend.live` or `staging.www.rcm.hs`.
- `LIVE_WEBSITE_URL` - The final URL of the website for live/prod. Example: `https://live.rcm-corporate.rcm.frontend.live` or `www.rcm.hs`
- `STORYBLOK_SPACE_ID` - The id of the Space in Storyblok. Example: 85566
- `STORYBLOK_SPACE_NAME` - The Name of the Space in Storyblok. Example: 'rcm-corporate'
- `ONETRUST_KEY` - The value of Onetrust's cookie consent token. Example: '8831b9b2-8a91-ddd-test'.
- `GOOGLE_TAG_MANAGER_ID` - The id from the Google Tag Manager account.
- `CLUDO_ENGINE_LIST` - List of cludo engine ids for this website, 1 engine per language. Example: 'pt:123412, en:1233244'
- `GATSBY_WHITE_LISTED_DOMAINS`- List of domains that are whitelisted to redirect without showing the 
on-click-notice, Example: '["rcm.com"]'
- `GATSBY_BASE_DOMAIN` - Base domain for the website related to this repo, example: 'rcm'
- `GATSBY_ASSET_URL_MASK` - URL to replace `a.storyblok.com` as the base domain for assets that aren't images or videos. Example: "assets.rcm.frontend.live" 

### Organization Level Secrets Shared between projects and workflows

- `AWS_ACCESS_KEY_ID` - The AWS Access Key ID used to deploy the infrastructure.
- `AWS_SECRET_ACCESS_KEY` - The AWS Secret Access Key used to deploy the infrastructure.
- `AWS_DEFAULT_REGION` - The AWS Default regions where the infrastructure is deployed.
- `COMPONENTS_LIBRARY_URL` - The URL of RCM components library version used by the website. Example: `http://live.rcm-components-library.rcm.frontend.live/releases/latest`
- `GOOGLE_RECAPTCHA_SITE_KEY` - The Google Recaptcha Site Key used to generate Google Recaptcha Validation tokens. Example: `xshso0sdfahdlsd0f`
- `WEBHOOKS_API_URL` - The URL of Rcm Webhooks API responsible for processing website related events. Example: `https://staging.apis.rcm.frontend.live/webhooks`
- `BRIGHTCOVE_ACCOUNT_ID`- The account ID for the Brightcove account
- `BRIGHTCOVE_PLAYER_ID`- The player ID for the Brightcove acccount
- `CLUDO_CUSTOMER_ID` - customer id for the cludo account. Example: '12345'

## Workflows

- Check - Verify quality requirements before enabling merge to master
- Preview - Deploy the `preview` website version used by Editor with unplublished content.
- Release - Deploy the `live` website version used by customers with plublished content.

This project follows the GitFlow.

staging > deploys staging
master  > deploys preview/live
