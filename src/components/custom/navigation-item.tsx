import React from 'react';
import Link from 'gatsby-link';
import StoryblokReact from 'storyblok-react';
import { Props } from '../types';

type NavigationItemProps = Props<{
  name: string;
  link: {
    cached_url: string;
  };
}>;

export const NavigationItem = ({ blok }: NavigationItemProps): JSX.Element => {
  const parsedUrl = blok.link.cached_url.replace('home', '') || '/';
  return (
    <StoryblokReact content={blok}>
      <li className="nav-item active">
        <Link className="nav-link" to={parsedUrl}>
          {blok.name}
        </Link>
      </li>
    </StoryblokReact>
  );
};
