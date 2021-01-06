/* eslint-disable @typescript-eslint/camelcase */
/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

type SEOProps = {
  title?: string;
  description?: string;
  lang?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  slug?: string;
  authorized_roles: string[];
};

export function SEO({
  title,
  description,
  lang,
  og_image,
  og_title,
  og_description,
  twitter_image,
  twitter_title,
  twitter_description,
  slug,
  authorized_roles,
}: SEOProps): JSX.Element {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            author
            url
            defaultLanguage
            twitterHandle
          }
        }
      }
    `,
  );
  const isPrivate = (authorized_roles !== undefined) && (authorized_roles.includes('authorized')) ? 'yes' : 'no';
  return (
    <Helmet
      htmlAttributes={{
        lang: lang === 'default' ? site.siteMetadata.defaultLanguage : lang,
      }}
      title={title}
      meta={[
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:image',
          content: og_image,
        },
        {
          property: 'og:title',
          content: og_title,
        },
        {
          property: 'og:description',
          content: og_description,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:url',
          content: `${site.siteMetadata.url}/${slug}`,
        },
        {
          name: 'twitter:image',
          content: twitter_image,
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:creator',
          content: site.siteMetadata.twitterHandle,
        },
        {
          name: 'twitter:title',
          content: twitter_title,
        },
        {
          name: 'twitter:description',
          content: twitter_description,
        },
        {
          name: 'private',
          content: isPrivate,
        },
      ]}
    />
  );
}

SEO.defaultProps = {
  lang: 'en',
  title: '',
  description: '',
  og_image: '',
  og_title: '',
  og_description: '',
  twitter_image: '',
  twitter_title: '',
  twitter_description: '',
  slug: '',
};
