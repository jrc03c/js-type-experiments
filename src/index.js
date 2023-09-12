const out = {
  createTypedArray: require("./create-typed-array"),
  defineTypedProperty: require("./define-typed-property"),
}

if (typeof module !== "undefined") {
  module.exports = out
}

if (typeof globalThis !== "undefined") {
  globalThis.createTypedArray = out.createTypedArray
  globalThis.defineTypedProperty = out.defineTypedProperty
}
