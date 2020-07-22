import React from "react"
import Link from "gatsby-link"
import SbEditable from "storyblok-react"

const NavigationItem = props => {
  const parsedUrl = props.blok.link.cached_url.replace("home", "") || '/';
  return (
    <SbEditable content={props.blok}>
      <li className="nav-item active">
        <Link className="nav-link" to={parsedUrl}>
          {props.blok.name}
        </Link>
      </li>
    </SbEditable>
  )
}

export default NavigationItem
