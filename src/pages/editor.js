// Template for view inside storyblok
import React, { Fragment } from "react"
import Components from "../components/components.js"
import SbEditable from "storyblok-react"
import config from "../../gatsby-config"
import Navigation from '../components/navigation/navigation'

const sbConfigs = config.plugins.filter(item => {
  return item.resolve === "gatsby-source-storyblok"
})
const sbConfig = sbConfigs.length > 0 ? sbConfigs[0] : {}

const loadStoryblokBridge = function (cb) {
  let script = document.createElement("script")
  script.type = "text/javascript"
  script.src = `//app.storyblok.com/f/storyblok-latest.js?t=${sbConfig.options.accessToken}`
  script.onload = cb
  document.getElementsByTagName("head")[0].appendChild(script)
}

class StoryblokEntry extends React.Component {
  constructor(props) {
    super(props)
    this.state = { story: null, globalNavi: { content: {} } }
  }

  componentDidMount() {
    loadStoryblokBridge(() => {
      this.initStoryblokEvents()
    })
  }

  loadStory() {
    window.storyblok.get(
      {
        slug: window.storyblok.getParam("path"),
        version: "draft",
        resolve_relations: sbConfig.options.resolveRelations || [],
      },
      data => {
        this.setState({ story: data.story })
        this.loadGlovalNavi(data.story.lang)
      }
    )
  }

  loadGlovalNavi(lang) {
    const language = lang === "default" ? "" : lang + "/"
    window.storyblok.get(
      {
        slug: `${language}global-navi`,
        version: "draft",
      },
      data => {
        this.setState({ globalNavi: data.story })
      }
    )
  }

  initStoryblokEvents() {
    this.loadStory()

    let sb = window.storyblok

    sb.on(["change", "published"], payload => {
      this.loadStory()
    })

    sb.on("input", payload => {
      if (this.state.story && payload.story.id === this.state.story.id) {
        payload.story.content = sb.addComments(
          payload.story.content,
          payload.story.id
        )
        this.setState({ story: payload.story })
      }
    })

    sb.pingEditor(() => {
      if (sb.inEditor) {
        sb.enterEditmode()
      }
    })
  }

  render() {
    if (this.state.story == null) {
      return <div></div>
    }

    let content = this.state.story.content
    let globalNavi = this.state.globalNavi.content

    return (
      <SbEditable content={content}>
        <Fragment>
          <Navigation blok={globalNavi}></Navigation>
          {React.createElement(Components(content.component), {
            key: content._uid,
            blok: content,
          })}
        </Fragment>
      </SbEditable>
    )
  }
}

export default StoryblokEntry
