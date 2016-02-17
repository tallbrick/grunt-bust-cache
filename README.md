# grunt-bust-cache
Grunt task to automate cache busting 

# Example Usage

```js
cacheBuster: {
  dev: {
    options: {
      devMode: true,
      entryPointHtml: {
        src: "src/main/resources/templates/index.html",
        dest: "<%= pathTo.compiled %>/WEB-INF/classes/templates/index.html"
      }
    }
  },
  prod: {
    options: {
      devMode: false,
      entryPointHtml: {
        src: "src/main/resources/templates/index.html",
        dest: "<%= pathTo.compiled %>/WEB-INF/classes/templates/index.html"
      }
    }
  }
}
```