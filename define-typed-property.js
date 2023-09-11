// options must include:
// - type
// options can optionally include:
// - allowsSubclassInstances

function defineTypedProperty(obj, prop, options) {
  let _value
  const { type } = options

  const allowsSubclassInstances =
    typeof options.allowsSubclassInstances === "undefined"
      ? true
      : !!options.allowsSubclassInstances

  if (typeof type !== "function" && typeof type !== "string") {
    throw new Error(
      `A 'type' property must be defined on the options object passed as the third argument to the \`defineTypedProperty\` function!`,
    )
  }

  Object.defineProperty(obj, prop, {
    ...options,

    get() {
      return _value
    },

    set(value) {
      if (typeof value === "object") {
        if (
          !(value instanceof type) ||
          (!allowsSubclassInstances && value.constructor.name !== type.name)
        ) {
          throw new Error(
            `The '${prop}' property can only have ${
              typeof type === "function" ? "`" + type.name + "`" : type
            } values assigned to it!`,
          )
        }
      } else {
      }

      _value = value
    },
  })
}

module.exports = defineTypedProperty
