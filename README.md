# Rcm Website Starter

This is the Rcm Website Starter, where you can find a boilerplate for Rcm websites built on Storyblok and the [Rcm Components Library](https://github.com/virtualidentityag/rcm-components-library).

## Pre-requisites
- node >= 12

## Quick start
- clone the repo and ensure you meet the pre-requisites above
- `npm i`
- `npm start`

## Building
Building and serving the application for development can be done using the `npm start` command.

Building the application can be done using the `npm run build` command. This will build an app with an "editor" page that can be used to preview new content on Storyblok.

The build loads the env vars found in /configuration based on the set environment, the default is "local". The environment can be changed by setting an env var "WEBSITE_STAGE". This is done when building the website
in the build pipeline.

## Linting
In your IDE, by using tools capable of reading the `.eslintrc` file and using "on-save" lint fixing, most linting errors should be fixed or at least visible to you during development.

Before every commit, the `npm run lint` command will be run to ensure code is formatted similarly and that the most general clean-code rules are followed across the entire project.

There are also a corresponding auto-fix command: `npm run lint:fix`.

## Environments

Since this repository should be used only as a starting point for a Rcm website, you should define your preview and staging environments yourself.

- http://preview.rcm-corporate-staging.rcm.frontend.live/ - Storyblok Draft / Staging Rcm rcm corporate Website
- http://live.rcm-corporate-staging.rcm.frontend.live/ - Storyblok Live / Staging Rcm rcm corporate Website
- http://preview.rcm-corporate.rcm.frontend.live/ - Storyblok Draft / latest released Rcm rcm corporate Website
- http://live.rcm-corporate.rcm.frontend.live/ - Storyblok Live / latest released Rcm rcm corporate Website

## Storyblok attributes
Below are some guidelines for developing Storyblok content types.

This applies only to the `Default` component. You can change any of this behaviour by creating a custom component that fits your needs.

### Naming
Storyblok attributes have to be named in `snake_case`. They will then automatically be converted to `kebab-case` when rendering the component.

### Reserved names
The `slotted` and `hidden` attribute names on content types are reserved and should not be used in components that rely on the `Default` component.

This also applies to attributes named `slotted_*` and `hidden_*` (where `*` is a wildcard).

*Note that you shouldn't name your Storyblok component's fields using the above keywords, unless you wish to trigger their associates behaviour.*

For further details, please refer below.

#### Slotted
By default, an attribute named `slotted` will be put inside another blok as a child component.

Additionally, an attribute named `slotted_xyz` will generate a named slot (`<div slot="xyz">…</slot>`) inside the parent component.

#### Hidden
An attribute named `hidden` will not be output to the frontend. These should be used as hidden fields that the backend can access.

This also applies to any `hidden_*` attributes.

## IDEs
To take advantage of the linter's strengths and to ensure no problems during merges, please consider installing the following plugins on your IDE.

If your IDE is not present on this list, please help us by making a PR to include proper plugins for it and ensure everyone shares this knowledge.

Hint: "on-save" linting can be a big help to save development time.

### VSCode
- dbaeumer.vscode-eslint

## Navigation
The navigation is automatically created from your Storyblok space's content:

- All stories with content type `page` are included;
- Navigation levels are built by grouping `page`s in storyblok folders. Sub levels are builte from pages and possible nested folders;
- Items on the navigation will display in the same order as they do on Storyblok's editor User interface;

By default, pages tagged as `access:private` or `navigation:hide` will not be shown on the navigation.

Pages tagged as `navigation:force-show` will always be displayed on the navigation.
`navigation:force-show` should only be used if an editor wishes to display a page that is also marked as private (`access:private` tag).

Pages tagged as `navigation:contact-page` will be displayed on the top right corner of the navigation.

## CLudo Crawler for search component
In order for the search component to work you need to set a github secret containing the cludo engine ids
example:
CLUDO_ENGINE_LIST= pt:123412, en:1233244

## 404 Page

This project provides localised 404 pages.
In order for these to be displayed, an entry must be created in Storyblok with slug `404` — preferably in the root folder.
Localised behaviour is the same as for every other variation.

*Please note that if you space does not have a 404 page created, the default 404 of your server will be displayed instead.*
## Environment Variables

_**Warning:** Sensible data must always be stored as a Github secret instead and referenced in the workflow files only_

App related data may be configured, per environment, on the available .env files found in /configuration.
Each configuration file maps to specific workflow, which env file gatsby uses depends on the WEBSITE_STAGE env var set on your machine, 
if nothing is set it uses the local env files

- .env.prod            -> env files for the production preview/live website
- .env.staging         -> env files for the production preview/live website
- .env.local            -> env files for local developement, this env file is used by default when building

## Git Workflow

The figure below shows what the branching model looks like. Arrows to the right (+->) indicate where to branch off from. Arrows to the left (<-+) show where to merge back into. The small dots (•) represent tags/releases.

```ruby
    |              |              |            |            |
    <-------------merge-----------+            |            | 
    |              |              |            |            | 
    |              |              |            |            |
    |              |              |            |            |
    |              |              <----merge---+            |
    |              |              |            <---squash---+
    |              |              |            |            |
    <----squash----+---------squash------------>            |
    |              |              |            |            |
    +-------------->              |            +------------>
    |              |              |            |            |
    |              |              |            |            |
    +              +              +            +            +
  master        hotfix/*        staging      develop     feature/*     
                                                         bugfix/*
                                                         refactor/*
```

## Branches
### Feature Branches / Bugfix Branches

These branches represent a new feature (a user story in agile projects). Create one of these branches for each story/feature or bugfix you want to develop to separate unfinished work from the code base.

* Branch from development
* Merge to development (squash merge)
* Gets deleted after the feature/bugfix has been merged to master and released

### develop

It contains all finished and approved feature branches. It can also be used to share finished stories that another story builds upon but that is not yet released.

The `develop` branch contains the most up-to-date code. Any feature/bugfix branches should be created from this branch.
To merge your feature/bugfix branch to the `develop` branch, you need to create a Pull Request and have it reviewed.

* Merges to `develop` are always squash merges

### staging

The `staging` branch is used to install a set of features onto a testing environment or staging server. Simply merge develop into this branch to get the latest code on your staging environment. This branch can be used for automated staging tests. With every push on it, an automated build can deploy this branch to your staging server.

* This branch is one-way. Only merge into and only from develop, never branch from or merge staging into another branch

### hotfix/*

These branches are used to merge urgent fixes that cannot wait for the next planned release.

* Branch from master
* Merge to `master` or `hotfix/*` (squash merge)  and `develop` (squash merge)
* Gets deleted after the feature/bugfix has been merged to master and develop
### master

Master is your main branch. Tags and Releases are created in that branch. It can go live anytime and tags here are used for production rollbacks if necessary.

## Notes on creating components
1. Create your own Storyblok space by duplicating the [staging space](https://app.storyblok.com/#!/me/spaces/104984/dashboard) in order to develop features
2. When your feature is ready for staging, add the schema to the website on the [schema configuration repo](https://github.com/virtualidentityag/rcm-storyblok-configuration). Follow the instruction in the readme to apply it to the staging space.
