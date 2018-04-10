# Chrome DevTools Frontend for Powwow's Web Explorer

The client-side of the Chrome DevTools, including all JS & CSS to run the DevTools webapp.

It is available on NPM as the [chrome-devtools-frontend](https://www.npmjs.com/package/chrome-devtools-frontend) package. It's not currently available via CJS or ES2015 modules, so consuming this package in other tools may require [some effort](https://github.com/paulirish/devtools-timeline-model/blob/master/index.js).

#### Versioning
`versions.json` contains the Chromium version, Chromium commit hash, and v8 version used by Powwow.

### Powwow Development
1. Make changes
2. `cd` to [gulp dir](scripts/gulp) and run `gulp build`
3. Push to Github
4. Tag the repo and Push tags to Github (We are incrementing the last number of the Chromium version)
5. Make sure to update bower.json of [Studio](https://github.com/powwowinc/PowwowDesigner/tree/6.0) webapp with the new version

### Source code
The frontend is available through a git subtree mirror on [chromium.googlesource.com](https://chromium.googlesource.com/chromium/src/third_party/WebKit/Source/devtools/), with a regularly updating GitHub mirror at [github.com/ChromeDevTools/devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend). The codebase's true location is in `third_party/WebKit/Source/devtools/` in [Chromium's git repo](https://chromium.googlesource.com/chromium/src/).

### Hacking
* DevTools documentation: [devtools.chrome.com](https://devtools.chrome.com)
* [Debugging protocol docs](https://developer.chrome.com/devtools/docs/debugger-protocol) and [Chrome Debugging Protocol Viewer](http://chromedevtools.github.io/debugger-protocol-viewer/)
* [awesome-chrome-devtools](https://github.com/paulirish/awesome-chrome-devtools): recommended tools and resources
* Contributing to DevTools: [bit.ly/devtools-contribution-guide](http://bit.ly/devtools-contribution-guide)

### Chrome Devtools Development
* All devtools commits: [View the log], [RSS feed] or [@DevToolsCommits] on Twitter
* [All open DevTools tickets] on crbug.com
* File a new DevTools ticket: [new.crbug.com](https://bugs.chromium.org/p/chromium/issues/entry?labels=OS-All,Type-Bug,Pri-2&components=Platform%3EDevTools)
* Code reviews mailing list: [devtools-reviews@chromium.org]

### Getting in touch with Chrome Devtools Team
* [@ChromeDevTools] on Twitter
* Chrome DevTools mailing list: [groups.google.com/forum/google-chrome-developer-tools](https://groups.google.com/forum/#!forum/google-chrome-developer-tools)

  [devtools-reviews@chromium.org]: https://groups.google.com/a/chromium.org/forum/#!forum/devtools-reviews
  [RSS feed]: https://feeds.peter.sh/chrome-devtools/
  [View the log]: https://chromium.googlesource.com/chromium/src/third_party/WebKit/Source/devtools/+log/master
  [@ChromeDevTools]: http://twitter.com/ChromeDevTools
  [@DevToolsCommits]: http://twitter.com/DevToolsCommits
  [all open DevTools tickets]: https://bugs.chromium.org/p/chromium/issues/list?can=2&q=component%3APlatform%3EDevTools&sort=&groupby=&colspec=ID+Stars+Owner+Summary+Modified+Opened
