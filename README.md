# Roche Component Library

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

## IDEs
To take advantage of the linter's strengths and to ensure no problems during merges, please consider installing the following plugins on your IDE.

If your IDE is not present on this list, please help us by making a PR to include proper plugins for it and ensure everyone shares this knowledge.

Hint: "on-save" linting can be a big help to save development time.

### VSCode
- dbaeumer.vscode-eslint
