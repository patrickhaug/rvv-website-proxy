import React from 'react';
import Link from 'gatsby-link';
import { SbEditableContent } from 'storyblok-react';
import { blokToComponent } from '../helpers';
import { Props } from '../types';

type NavigationProps = Props<{ items: SbEditableContent[] }>;

export const Navigation = ({ blok, getComponent }: NavigationProps): JSX.Element => (
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
