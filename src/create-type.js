const { pascalify } = require("@jrc03c/js-text-tools")

function createType(name, fn) {
  if (typeof name !== "string") {
    throw new Error(
      "The first argument passed into the `createType` function must be a string representing the type's name!",
    )
  }

  if (typeof fn !== "function") {
    throw new Error(
      "The second argument passed into the `createType` function must be a function that tests a single value and returns true or false depending on whether or not the value 'matches' the type!",
    )
  }

  const out = class {
    static [Symbol.hasInstance](value) {
      try {
        return !!fn(value)
      } catch (e) {
        try {
          return value instanceof fn
        } catch (e) {
          return false
        }
      }
    }
  }

  Object.defineProperty(out, "name", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: pascalify(name),
  })

  return out
}

module.exports = createType
