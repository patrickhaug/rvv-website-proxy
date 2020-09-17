import React from 'react';
import Link from 'gatsby-link';
import StoryblokReact, { SbEditableContent } from 'storyblok-react';
import { blokToComponent } from '../helpers';
import { Props } from '../types';

type NavigationProps = Props<{ items: SbEditableContent[] }>;

type NavigationItemProps = Props<{
  name: string;
  link: {
    cached_url: string;
  };
}>;

export const RocheNavigationItem = ({ blok }: NavigationItemProps): JSX.Element => {
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

export const RocheNavigation = ({ blok, getComponent }: NavigationProps): JSX.Element => (
  <nav className="navbar navbar-expand navbar-light bg-light">
    <span>Language Switch</span>
    <ul>
      <li>
        <Link to="/">en</Link>
      </li>
      <li>
        <Link to="/de">de</Link>
      </li>
      <li>
        <Link to="/pt">pt</Link>
      </li>
    </ul>
    <div>
      <span>Site Navigation</span>
      <ul className="navbar-nav">
        {blok.items && blok.items.map((item) => blokToComponent(
          { blok: item, getComponent }, 'navigation',
        ))}
      </ul>
    </div>
  </nav>
);
