const { isDate } = require("@jrc03c/js-math-tools")

// options must include:
// - type
// options can optionally include:
// - allowsSubclassInstances
function defineTypedProperty(obj, prop, type, options) {
  options = options || {
    configurable: true,
    enumerable: true,
  }

  let _value

  const allowsSubclassInstances =
    typeof options.allowsSubclassInstances === "undefined"
      ? true
      : !!options.allowsSubclassInstances

  if (typeof type !== "function" && typeof type !== "string") {
    throw new Error(
      `A 'type' value (i.e., a class name or a string like "number" representing a primitive type) must be passed as the third argument to the \`defineTypedProperty\` function!`,
    )
  }

  if (type === null || typeof type === "undefined") {
    throw new Error(
      `A 'type' value (i.e., a class name or a string like "number" representing a primitive type) must be passed as the third argument to the \`defineTypedProperty\` function!`,
    )
  }

  if (type === Array) {
    throw new Error(
      "It's not possible to create a property of type Array (though you *can* create a TypedArray property)!",
    )
  }

  function getTypeString() {
    if (typeof type === "function") {
      return type.name
    } else {
      return type
    }
  }

  function canAccept(value) {
    if (value === null || typeof value === "undefined") {
      return true
    }

    if (this.type === "number" && typeof value === "number" && isNaN(value)) {
      return true
    }

    if (type === Date && isDate(value)) {
      return true
    }

    try {
      return (
        value instanceof type &&
        (allowsSubclassInstances || value.constructor.name === type.name)
      )
    } catch (e) {
      return typeof value === type
    }
  }

  function challenge(value) {
    if (canAccept(value)) {
      return true
    } else {
      throw new Error(
        `The '${prop}' property can only have ${getTypeString()} values assigned to it!`,
      )
    }
  }

  Object.defineProperty(obj, prop, {
    ...options,

    get() {
      return _value
    },

    set(value) {
      challenge(value)
      _value = value
    },
  })
}

module.exports = defineTypedProperty
