import React, { Fragment } from "react"
import Components from "../components.js"

const Page = props => (
  <Fragment>
    {props.blok.body &&
      props.blok.body.map(blok =>
        React.createElement(Components(blok.component), {
          key: blok._uid,
          blok: blok,
        })
      )}
  </Fragment>
)

export default Page
