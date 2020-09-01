# Roche Website Starter

This is the Roche Website Starter, where you can find a boilerplate for Roche websites built on Storyblok and the [Roche Components Library](https://github.com/RocheGlobal/roche-component-library).

## Pre-requisites
- node >= 12

## Quick start
- clone the repo and ensure you meet the pre-requisites above
- `npm i`
- `npm start`

## Building
Building and serving the application for development can be done using the `npm start` command.

Building the application for production can be done using the `npm run build` command. This will build an app with an "editor" page that can be used to preview new content on Storyblok.

You can also build an app without the "editor" page by running `npm run build:public`.

## Linting
In your IDE, by using tools capable of reading the `.eslintrc` file and using "on-save" lint fixing, most linting errors should be fixed or at least visible to you during development.

Before every commit, the `npm run lint` command will be run to ensure code is formatted similarly and that the most general clean-code rules are followed across the entire project.

There are also a corresponding auto-fix command: `npm run lint:fix`.

## Environments

Since this repository should be used only as a starting point for a Roche website, you should define your preview and staging environments yourself.

Nevertheless you can access a deployed version of this repo using the latest Roche Component Library here: http://roche-website-starter-website.s3-website.eu-central-1.amazonaws.com/

## Storyblok attributes
Below are some guidelines for developing Storyblok content types.

This applies only to the `Default` component. You can change any of this behaviour by creating a custom component that fits your needs.

### Naming
Storyblok attributes have to be named in `snake_case`. They will then automatically be converted to `kebab-case` when rendering the component.

### Reserved names
The `slotted` and `hidden` attribute names on content types are reserved and should not be used in components that rely on the `Default` component.

This also applies to attributes named `slotted-*` and `hidden-*` (where `*` is a wildcard).

*Note that you shouldn't name your Storyblok component's fields using the above keywords, unless you wish to trigger their associates behaviour.*

For further details, please refer below.

#### Slotted
By default, an attribute named `slotted` will be put inside another blok as a child component.

Additionally, an attribute named `slotted-xyz` will generate a named slot (`<slot name="xyz">…</slot>`) inside the parent component.

#### Hidden
An attribute named `hidden` will not be output to the frontend. These should be used as hidden fields that the backend can access.

This also applies to any `hidden-*` attributes.

## IDEs
To take advantage of the linter's strengths and to ensure no problems during merges, please consider installing the following plugins on your IDE.

If your IDE is not present on this list, please help us by making a PR to include proper plugins for it and ensure everyone shares this knowledge.

Hint: "on-save" linting can be a big help to save development time.

### VSCode
- dbaeumer.vscode-eslint
