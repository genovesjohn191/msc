# Macquarie Fusion Angular Portal


> [Angular 2](https://angular.io), [Angular 4](https://github.com/angular/angular/tree/4.0.0-beta.0) ([Ahead of Time Compile](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html), [Router](https://angular.io/docs/ts/latest/guide/router.html), [Forms](https://angular.io/docs/ts/latest/guide/forms.html),
[Http](https://angular.io/docs/ts/latest/guide/server-communication.html),
[Services](https://gist.github.com/gdi2290/634101fec1671ee12b3e#_follow_@AngularClass_on_twitter),
[Tests](https://angular.io/docs/ts/latest/guide/testing.html), [E2E](https://angular.github.io/protractor/#/faq#what-s-the-difference-between-karma-and-protractor-when-do-i-use-which-)), [Karma](https://karma-runner.github.io/), [Protractor](https://angular.github.io/protractor/), [Jasmine](https://github.com/jasmine/jasmine), [Istanbul](https://github.com/gotwarlost/istanbul), [TypeScript](http://www.typescriptlang.org/), [@types](https://www.npmjs.com/~types), [TsLint](http://palantir.github.io/tslint/), [Codelyzer](https://github.com/mgechev/codelyzer), [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html), and [Webpack 2](http://webpack.github.io/).

## Quick start 

> Make sure you have Node version >= 5.0 and NPM >= 3

1.  Clone repo `git@bitbucket.org:macquariecloudservices/macquarie-fusion-angular-portal.git`

2. Change directory to your cloned repo

3. Install the repo with `npm install`

3. Start the server `npm start`
	
	Use Hot Module Replacement `npm run server:dev:hmr`

5. Go to [http://0.0.0.0:3000](http://0.0.0.0:3000) or [http://localhost:3000](http://localhost:3000) in your browser

## Getting Started
### Dependencies
What you need to run this app:

*  `node` and `npm`
*  Ensure you're running the latest versions Node `v4.x.x`+ (or `v5.x.x`) and NPM `3.x.x`+

Once you have those, you should install these globals with `npm install --global`:

*  `webpack` (`npm install --global webpack`)
* `webpack-dev-server` (`npm install --global webpack-dev-server`)
* `karma` (`npm install --global karma-cli`)
* `protractor` (`npm install --global protractor`)
* `typescript` (`npm install --global typescript`)

### Installing
* `fork` this to your feature branch
* `clone` your branch
* `npm install webpack-dev-server rimraf webpack -g` to install required global dependencies
* `npm install` to install all dependencies
* `npm run server` to start the dev server in another tab

## Running the app
After you have installed all dependencies you can now run the app. Run `npm run server` to start a local server using `webpack-dev-server` which will watch, build (in-memory), and reload for you. The port will be displayed to you as `http://0.0.0.0:3000` (or if you prefer IPv6, if you're using `express` server, then it's `http://[::1]:3000/`).

## Server
### Development
`npm run server`
### Production
 `npm run build:prod`

 `npm run server:prod`

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
Configuration files live in `config/` we are currently using webpack, karma, and protractor for different stages of your application

# AoT Don'ts
The following are some things that will make AoT compile fail.

- Don’t use require statements for your templates or styles, use styleUrls and templateUrls, the angular2-template-loader plugin will change it to require at build time.
- Don’t use default exports.
- Don’t use `form.controls.controlName`, use `form.get(‘controlName’)`
- Don’t use `control.errors?.someError`, use `control.hasError(‘someError’)`
- Don’t use functions in your providers, routes or declarations, export a function and then reference that function name
- @Inputs, @Outputs, View or Content Child(ren), Hostbindings, and any field you use from the template or annotate for Angular should be public