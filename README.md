# Macquarie Fusion Angular Portal


> [Angular 14](https://angular.io), [Ahead of Time Compile](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html), [Router](https://angular.io/docs/ts/latest/guide/router.html), [Forms](https://angular.io/docs/ts/latest/guide/forms.html),
[Http](https://angular.io/docs/ts/latest/guide/server-communication.html),
[Services](https://gist.github.com/gdi2290/634101fec1671ee12b3e#_follow_@AngularClass_on_twitter),
[Tests](https://angular.io/docs/ts/latest/guide/testing.html), [E2E](https://angular.github.io/protractor/#/faq#what-s-the-difference-between-karma-and-protractor-when-do-i-use-which-)), [Karma](https://karma-runner.github.io/), [Protractor](https://angular.github.io/protractor/), [Jasmine](https://github.com/jasmine/jasmine), [Istanbul](https://github.com/gotwarlost/istanbul), [TypeScript](http://www.typescriptlang.org/), [@types](https://www.npmjs.com/~types), [TsLint](http://palantir.github.io/tslint/), [Codelyzer](https://github.com/mgechev/codelyzer), [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html), and [Webpack 2](http://webpack.github.io/).

## Quick start

> Make sure you have Node version >= 14, NPM >= 6 and Angular CLI.

1.  Clone repo `git@bitbucket.org:macquariecloudservices/mcs.portal.frontend.git`

2. Change directory to your cloned repo

3. Install the dependencies with `npm install`

4. Configure the environment settings in `env.config.js` file

5. You will need the `dev-portal.key` in order to run the project. Place this file inside `ssl` folder under the root directory.

6. Start the server `npm start`

	**Use Hot Module Replacement `npm run server:dev:hmr`

7. Go to [https://dev-portal.macquariecloudservices.com:4200/](https://dev-portal.macquariecloudservices.com:4200/) in your browser

## Getting Started
### Dependencies
What you need to run this app:

*  `Node.js` Javascript runtime and `npm` package manager
*  npm is included with Node.js which you can install from [Node.js downloads](https://nodejs.org/en/download/) 

    Note: Installing Node.js requires Administrator access, so ensure that you have the right permission before installing.

    To test that you have Node.js and npm correctly installed on your machine, you can type `node --version` and `npm --version`.
* Install the Angular CLI with `npm install -g @angular/cli`.

    Once installation is completed run `ng --version`, to check the Angular CLI version.

### Installing
* `fork` this to your feature branch
* `clone` your branch
* `npm install` to install all dependencies
* `npm run server` to start the dev server in another tab

## Running the app
After you have installed all dependencies you can now run the app. Run `npm run server` to start a local server using `webpack-dev-server` which will watch, build (in-memory), and reload for you. The port will be displayed to you as `https://dev-portal.macquariecloudservices.com/`.

## Server
### Development
`npm run server`
### Production
 `npm run build:prod`

 `npm run server:prod`

### Serv from Localhost
Append this line `--inline --port 8080 --host 10.3.155.169 --content-base`
to `webpack-server-dev` and
execute `npm start`

## Other commands
### Development
`npm run build:dev`
### Production (jit)
`npm run build:prod`
### AoT
`npm run build:aot`
### Hot module replacement
`npm run server:dev:hmr`
### Watch and build files
`npm run watch`
### Run unit tests
`npm run test`
### Watch and run our tests
`npm run watch:test`

### Run end-to-end tests
**update Webdriver (optional, done automatically by postinstall script)**

`npm run webdriver:update`

**this will start a test server and launch Protractor**

`npm run e2e`

### Continuous integration (run unit tests and e2e tests together)
**this will test both your JIT and AoT builds**

`npm run ci`

### Run Protractor's elementExplorer (for end-to-end)

`npm run e2e:live`

### Build Docker
`npm run build:docker`

# Configuration
Configuration files live in `config/` we are currently using webpack, karma, and protractor for different stages of the application

# Environment Variables
Environment variable setup can be done both in the container build process and when running a container

## Development
- Simply supply your values in `assets/env.config.js`

## Development AoT Testing
- First build app in AoT `npm run build:aot`
- Test in browser using `npm run server:prod:ci`

## Build
1. Customize environment variables from the `env.setup` file on the root directory.
2. Set the variables by calling `$ source ./env.setup` from the root directory.
3. Optionally you can confirm if the environment variables are correct using `$ echo $VAR_NAME`
4. Run your `npm run build` command.

## Container
- Supply environment variables via `docker run` command
    e.g. `docker run -d -p 80:80 --env MCS_API_HOST=https://lab-api.macquariecloudservices.com frontend:latest`

# AoT Don'ts
The following are some things that will make AoT compile fail.

- Don’t use require statements for your templates or styles, use styleUrls and templateUrls, the angular2-template-loader plugin will change it to require at build time.
- Don’t use default exports.
- Don’t use `form.controls.controlName`, use `form.get(‘controlName’)`
- Don’t use `control.errors?.someError`, use `control.hasError(‘someError’)`
- Don’t use functions in your providers, routes or declarations, export a function and then reference that function name
- @Inputs, @Outputs, View or Content Child(ren), Hostbindings, and any field you use from the template or annotate for Angular should be public
- https://github.com/rangle/angular-2-aot-sandbox#aot-dos-and-donts


# Updating Dependencies
Run `npm install -g npm-check-updates` to install CLI-tool.

1. Navigate to the project root directory where `package.json` resides.
2. Run `ncu` to check for dependencies that are behind latest versions.
3. Run `ncu -u` to update all dependencies to latest.
4. Run `npm run clean`
5. Run `npm install`
6. Run `npm run clean:shrinkwrap`
7. Run `npm shrinkwrap`.
   Now, `npm install` will now use exact versions in `npm-shrinkwrap.json`
   If you check `npm-shrinkwrap.json` into git, all installs will use the exact same versions.

# Development Notes

Read [Typescript Coding Guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines) before working on this repository.

## Environment

Suggested IDE: [VS Code](https://code.visualstudio.com/)

Extensions: [TSLint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint), [HTMLHint](https://marketplace.visualstudio.com/items?itemName=mkaufman.HTMLHint), [DebuggerForChrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome), [HTMLScssSupport](https://marketplace.visualstudio.com/items?itemName=P-de-Jong.vscode-html-scss)

### Pull Requests Check List
- Run `npm run lint` (Note: must pass with no errors/warnings)
- Run `npm test` (Note: all unit test must be passing)
- Feature branch should follow this format:
>
	{feature/update/fix/hotfix}/{JIRA-#}-{Branch-Title}
e.g.
>
	feature/FUSION-99-Added-Custom-Module
	fix/FUSION-201-Removed-Useless-Buttons

- Commit message should follow this format:
>
	{JIRA-#} #comment {message}
> e.g.
>
	FUSION-99 #comment Added Custom module and refactored Custom component

- Before adding reviewers in your Bitbucket PR, run thru the diff and make sure everything is final and ready for code review.
- Use description area for instructions on set-up, usage, and other non-trivial information about your changes.
- Dead code and commented code should never be committed.

### CI/CD

This repository contains a Jenkinsfile that defines a Jenkins pipeline for CI/CD of the portal frontend.

The job is dependent on an initial Kubernetes deployment of the portal using the k8s yaml files in the fusion workspace (see fusion-workspace/k8s/mcs.portal.frontend/).

It is also dependent on an env.setup file injected via a configmap.

The env.setup file should look like this:

    export HOST='lab-portal.macquariecloudservices.com'
    export PORT='80'
    export API_URL='http://lab-api.macquariecloudservices.com/api'

Then create the configmap like so:

    kubectl create configmap portal-frontend-build-env-setup --from-file=env.setup

Point a new Jenkins pipeline job at the ssh git repository for this project. The Jenkins master must itself be deployed within kubernetes and have the [https://github.com/jenkinsci/kubernetes-plugin/blob/master/README.md](jenkinsci kubernetes)) plugin installed. Follow the instructions in the [https://github.com/jenkinsci/kubernetes-plugin/blob/master/README.md](README.md) for that plugin to get Jenkins to talk to your kubernetes cluster.

The blue ocean container is a nice plugin on top of Jenkins and is highly recommended.

### ERRORS

    An unhandled exception occurred: ENOENT: no such file or directory, open 'F:\mcs.portal.frontend\ssl\dev-portal.key'

Ensure ssl/dev-portal.key file exists in your project. If none, ask for a generated private key from your team.
