import ComponentNotFound from "./component-not-found/component-not-found"
import Page from './page/page.js'
import POCHeadline from './poc-headline/poc-headline';
import NavigationItem from "./navigation/navigation-item/navigation-item"

const ComponentList = {
  page: Page,
  headline: POCHeadline,
  nav_item: NavigationItem,
}

const Components = type => {
  if (typeof ComponentList[type] === "undefined") {
    return ComponentNotFound
  }
  return ComponentList[type]
}

export default Components
