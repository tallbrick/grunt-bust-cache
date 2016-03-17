# grunt-bust-cache
> Grunt task to automate cache busting 

### Getting Started
This plugin requires Node `~0.12` and Grunt `~0.4.0`

### The "bustCache" task

Use the `bustCache` task for cache busting static files in your application. This allows the assets to have a large expiry time in the browsers cache and will only be forced to use an updated file when the contents of it changes.

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
      javascript: false
    },
    src: "path/to/your/projects/index.html"
  }
}
```

### Options

#### Summary

```
// Here is a short summary of the options and some of their 
defaults. Extra details are below.
{
  css: true,                             // Algoirthm used for hashing files
  requireJs: false,                      // Algoirthm used for hashing files
  urlKey: "v",                           // Algoirthm used for hashing files

  hashType: "timestamp",                 // git, npm, maven, timestamp
  pathToGitRepo: "./",                   // Algoirthm used for hashing files
  pathToPom: "pom.xml"                   // Algoirthm used for hashing files
}
```

#### options.hashType
Type: `String`  
Default value: `'timestamp'`

Possible values include `'git'`, `'npm'`, `'maven'`, `'timestamp'`

## Credits
This plugin was inspired by [grunt-cache-bust](https://github.com/hollandben/grunt-cache-bust)