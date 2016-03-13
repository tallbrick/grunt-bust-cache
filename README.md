# grunt-bust-cache
Grunt task to automate cache busting 

# Example Usage

```js
cacheBuster: {
  dev: {
    options: {
      hashType: "timestamp", // git, npm, maven, timestamp
      css: true,
      requireJs: true,
      javascript: false
    },
    src: "<%= pathTo.project %>/WEB-INF/classes/templates/index.html"
  },
  prod: {
    options: {
      hashType: "timestamp", // git, npm, maven, timestamp
      css: true,
      requireJs: true,
      javascript: false
    },
    src: "<%= pathTo.project %>/WEB-INF/classes/templates/index.html"
  }
}
```