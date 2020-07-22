import React from "react"
import Link from "gatsby-link"
import Components from "../components.js"


const Navigation = props => (
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
        {props.blok.nav_items &&
          props.blok.nav_items.map(blok =>
            React.createElement(Components(blok.component), {
              key: blok._uid,
              blok: blok,
            })
          )}
      </ul>
    </div>
  </nav>
)

export default Navigation
