const { pascalify } = require("@jrc03c/js-text-tools")

class TypedArray extends Array {
  constructor(type, allowsSubclassInstances) {
    super()

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
    if (typeof value === "object") {
      return (
        value instanceof this.type &&
        (this.allowsSubclassInstances ||
          value.constructor.name === this.typeString)
      )
    } else {
      return typeof value === this.type
    }
  }

  challenge(value) {
    if (this.canAccept(value)) {
      return true
    } else {
      throw new Error(
        `The instance of TypedArray<${
          this.typeString
        }> cannot accept this value: ${
          typeof value === "string" ? JSON.stringify(value) : value
        }`
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

function createTypedArray(type, allowsSubclassInstances) {
  const tempClass = class Temp extends TypedArray {}
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
