# glodule
Glodule collects global-polluting variables from scripts and exposes them as if they were module members.

### Why not [`global` option from SystemJS](https://github.com/systemjs/systemjs/blob/master/docs/module-formats.md#globals)?

It's useful for SystemJS users but a user may use CommonJS, AMD, or even ES2015 native module syntax. Glodule provides a low-level utility to use with any module loaders.

### Use

```js
// foo.global.js
// code works on traditonal module-unsupported platform
var global = true;
```

```js
// index.commonjs.js
// a shim code for CommonJS system including Node.js
module.exports = glodule("foo.global.js");

// index.amd.js
// a shim code for AMD system
define(glodule("foo.global.js"));

// index.es2015.js
// a shim code for ES2015 compatible system
export default glodule("foo.global.js");
```
