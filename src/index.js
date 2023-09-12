const out = {
  createType: require("./create-type"),
  createTypedArray: require("./create-typed-array"),
  defineTypedProperty: require("./define-typed-property"),
}

if (typeof module !== "undefined") {
  module.exports = out
}

if (typeof globalThis !== "undefined") {
  Object.keys(out).forEach(key => {
    globalThis[key] = out[key]
  })
}
