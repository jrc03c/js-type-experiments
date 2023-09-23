const { isDate } = require("@jrc03c/js-math-tools")
const { pascalify } = require("@jrc03c/js-text-tools")

class TypedArray extends Array {
  static registry = {}

  static from(arr) {
    // NOTE: This implementation is intentionally different from the
    // superclass's implementation. That's because I want this function to be
    // able to construct nested arrays if necessary, which means that I won't
    // know how to handle possible `mapFn` or `thisArg` arguments. I'll show a
    // warning if users pass in more than one argument.
    if (arguments.length > 1) {
      console.warn(
        "WARNING: The `TypedArray.from` static method's implementation differs from the standard `Array.from` static method's implementation. The `TypedArray.from` method only accepts one argument: an array of values. That array can be nested arbitrarily deeply.",
      )
    }

    const out = createTypedArray(TypedArray.registry[this.name])

    arr.forEach(value => {
      if (this.isArray(value)) {
        out.push(this.from(value))
      } else {
        out.push(value)
      }
    })

    return out
  }

  constructor(type, allowsSubclassInstances) {
    super()

    if (type === null || typeof type === "undefined") {
      throw new Error(
        `A type must be passed as the first argument to the \`TypedArray\` constructor!`,
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

    try {
      if (
        value instanceof this.type &&
        (this.allowsSubclassInstances ||
          value.constructor.name === this.typeString)
      ) {
        return true
      }
    } catch (e) {
      // ...
    }

    if (typeof value === "object") {
      if (typeof this.type === "function") {
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
        `A ${this.constructor.name} cannot contain the value: ${
          typeof value === "string" || typeof value === "object"
            ? JSON.stringify(value)
            : value
        }`,
      )
    }
  }

  concat() {
    const out = this.constructor.from(this)

    Array.from(arguments).forEach(arr => {
      arr.forEach(value => {
        this.challenge(value)
        out.push(value)
      })
    })

    return out
  }

  fill(value, start, end) {
    this.challenge(value)
    return super.fill(value, start, end)
  }

  from() {
    return this.constructor.from(...arguments)
  }

  map(fn, thisArg) {
    const out = super.map(fn, thisArg)

    try {
      return this.constructor.from(out)
    } catch (e) {
      return Array.from(out)
    }
  }

  push() {
    Array.from(arguments).forEach(value => {
      this.challenge(value)
    })

    return super.push(...arguments)
  }

  slice() {
    const out = createTypedArray(this.type, this.allowsSubclassInstances)
    out.push(...super.slice(...arguments))
    return out
  }

  splice() {
    Array.from(arguments)
      .slice(2)
      .forEach(value => {
        this.challenge(value)
      })

    return super.splice(...arguments)
  }

  toReversed() {
    const out = createTypedArray(this.type, this.allowsSubclassInstances)

    for (let i = this.length - 1; i >= 0; i--) {
      out.push(this[i])
    }

    return out
  }

  toSorted() {
    const temp = Array.from(this)
    temp.sort(...arguments)
    return this.constructor.from(temp)
  }

  toSpliced() {
    const temp = Array.from(this)
    temp.splice(...arguments)
    return this.constructor.from(temp)
  }

  unshift() {
    Array.from(arguments).forEach(value => {
      this.challenge(value)
    })

    return super.unshift(...arguments)
  }

  with(index, value) {
    const out = this.slice()
    out[index] = value
    return out
  }
}

function createTypedArray(type, allowsSubclassInstances) {
  const TempClass = (() => {
    if (TypedArray.registry[type]) {
      return TypedArray.registry[type]
    } else {
      class Temp extends TypedArray {}
      TypedArray.registry[type] = Temp
      return Temp
    }
  })()

  const out = new TempClass(type, allowsSubclassInstances)

  Object.defineProperty(out.constructor, "name", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: `${pascalify(out.typeString)}Array`,
  })

  TypedArray.registry[out.constructor.name] = type

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
