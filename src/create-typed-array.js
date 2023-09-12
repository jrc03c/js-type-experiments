const { isDate } = require("@jrc03c/js-math-tools")
const { pascalify } = require("@jrc03c/js-text-tools")

class TypedArray extends Array {
  constructor(type, allowsSubclassInstances) {
    super()

    if (type === null || typeof type === "undefined") {
      throw new Error(
        `A type must be passed as the first argument to the \`createTypedArray\` function!`,
      )
    }

    if (type === Array) {
      throw new Error("It's not possible to create a TypedArray<Array>!")
    }

    Object.defineProperty(this, "type", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: type,
    })

    if (
      typeof allowsSubclassInstances === "undefined" ||
      allowsSubclassInstances === null
    ) {
      allowsSubclassInstances = true
    }

    Object.defineProperty(this, "allowsSubclassInstances", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: allowsSubclassInstances,
    })
  }

  get typeString() {
    if (typeof this.type === "function") {
      return this.type.name
    } else {
      return this.type
    }
  }

  canAccept(value) {
    if (value === null || typeof value === "undefined") {
      return true
    }

    if (this.type === "number" && typeof value === "number" && isNaN(value)) {
      return true
    }

    if (this.type === Date && isDate(value)) {
      return true
    }

    if (typeof value === "object") {
      if (typeof this.type === "function") {
        if (
          value instanceof this.type &&
          (this.allowsSubclassInstances ||
            value.constructor.name === this.typeString)
        ) {
          return true
        }

        if (value instanceof this.constructor) {
          return true
        }

        return false
      } else if (value instanceof this.constructor) {
        return true
      } else {
        return false
      }
    } else {
      return typeof value === this.type
    }
  }

  challenge(value) {
    if (this.canAccept(value)) {
      return true
    } else {
      throw new Error(
        `A TypedArray<${this.typeString}> cannot accept the value: ${
          typeof value === "string" || typeof value === "object"
            ? JSON.stringify(value)
            : value
        }`,
      )
    }
  }

  push() {
    Array.from(arguments).forEach(value => {
      this.challenge(value)
    })

    return super.push(...arguments)
  }

  splice() {
    Array.from(arguments)
      .slice(2)
      .forEach(value => {
        this.challenge(value)
      })

    return super.splice(...arguments)
  }
}

const registry = {}

function createTypedArray(type, allowsSubclassInstances) {
  const tempClass = (() => {
    if (registry[type]) {
      return registry[type]
    } else {
      class Temp extends TypedArray {}
      registry[type] = Temp
      return Temp
    }
  })()

  const out = new tempClass(type, allowsSubclassInstances)

  Object.defineProperty(out.constructor, "name", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: `${pascalify(out.typeString)}TypedArray`,
  })

  return new Proxy(out, {
    get() {
      return Reflect.get(...arguments)
    },

    set(target, prop, value, receiver) {
      const intProp = parseInt(prop)

      if (!isNaN(intProp) && parseFloat(prop) === intProp && intProp >= 0) {
        receiver.challenge(value)
      }

      return Reflect.set(...arguments)
    },
  })
}

module.exports = createTypedArray
