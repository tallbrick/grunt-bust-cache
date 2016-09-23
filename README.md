# grunt-bust-cache [![Build Status](https://travis-ci.org/tallbrick/grunt-bust-cache.svg?branch=master)](https://travis-ci.org/tallbrick/grunt-bust-cache)
> Grunt task to automate your cache-bust configuration


### Getting Started
This plugin requires Node `4.x.x` and Grunt `1.x.x`


### Install

```
$ npm install --save-dev grunt-bust-cache
```


### The "bustCache" task

Use the `bustCache` task for cache busting static files in your application. This allows the assets to have a large expiry time in the browsers cache and will only be forced to use an updated file when the contents of it changes.

This plugin supports:

* Hash calculation in multiple formats
* Multiple cache bust methods (including RequireJS's urlArgs)


### Example Usage

```js
bustCache: {
  dev: {
    options: {
      hashType: "timestamp", // git, npm, maven, timestamp
      css: true,
      requireJs: true,
      javascript: false
    },
    src: "path/to/your/projects/index.html"
  },
  prod: {
    options: {
      hashType: "maven", // git, npm, maven, timestamp
      css: true,
      requireJs: true,
      javascript: true
    },
    src: "path/to/your/projects/index.html"
  }
}
```


### Supported File Paths

```
bustCache: {
  foo: {
    // Path to a single file
    src: "path/to/your/projects/index.html"
  },
  bar: {
    // Specify both source and destination
    src: "path/to/your/source/file.html", // Can be string or array
    dest: "path/to/your/destination/file.html"
  },
  baz: {
    // Specify multiple file pairs
    files: [
      {
        src: "path/to/your/source/file.html",
        dest: "path/to/your/destination/file.html"
      }
    ]
  }
}
```


### Options

#### Summary

```
// Here is a short summary of the options and some of their 
// defaults. Extra details are below.
options: {
  css: true,                   // Add hash string to CSS includes
  javascript: true,            // Add hash string to JS includes
  requireJs: false,            // Add requirejs config which includes hash string
  urlKey: "v",                 // Querystring variable name to contain the hash

  hashType: "timestamp",       // Hash type.  Values include: git, npm, maven, timestamp
  pathToGitRepo: "./",         // Location of the git repo (used in finding the git SHA-1 hash)
  pathToPom: "./pom.xml"       // Localtion of the (used in finding the Maven project verison)
}
```

#### options.css
Type: `Boolean`  
Default value: `true`

When set to `true`, `bustCache` will add a version hash to all CSS `<link>` tags.

#### options.javascript
Type: `Boolean`  
Default value: `true`

When set to `true`, `bustCache` will add a version hash to all JavaScript `<script>` tags.

#### options.requireJs
Type: `Boolean`  
Default value: `false`

When set to `true`, `bustCache` will add a RequireJs config block that sets the `urlArgs` to the version hash.
Learn more about [RequireJs urlsArgs parameter](http://requirejs.org/docs/api.html#config-urlArgs).

#### options.hashType
Type: `String`  
Default value: `'timestamp'` 
Possible values: `'git'`, `'npm'`, `'maven'`, `'timestamp'`

* **timestamp:** runs simple JavaScript during the build to generate a unique hash

* **git:** queries git for the latest commit hash using: `git rev-parse --verify HEAD`

* **npm:** opens the `project.json` file to get the project version

* **maven:** opens the `pom.xml` to get the project version


## Alternatives
https://www.npmjs.com/package/grunt-replace

## Credits
This plugin was inspired by [grunt-cache-bust](https://github.com/hollandben/grunt-cache-bust)