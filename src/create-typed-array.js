const { flatten, isArray } = require("@jrc03c/js-math-tools")
const { pascalify } = require("@jrc03c/js-text-tools")
const isOfType = require("./is-of-type")

const canUseNewKeyword = {
  allowsSubclassInstances: {},
  doesNotAllowSubclassInstances: {},
}

class TypedArray extends Array {
  static allowsSubclassInstances = true

  static registry = {
    allowsSubclassInstances: {},
    doesNotAllowSubclassInstances: {},
  }

  static type = null

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

    const key = this.allowsSubclassInstances
      ? "allowsSubclassInstances"
      : "doesNotAllowSubclassInstances"

    const out = createTypedArray(TypedArray.registry[key][this.name])

    if (arguments.length === 0) {
      return out
    }

    arr.forEach(value => {
      if (this.isArray(value)) {
        const key = this.allowsSubclassInstances
          ? "allowsSubclassInstances"
          : "doesNotAllowSubclassInstances"

        canUseNewKeyword[key][this.type] = true
        const temp = new this()
        canUseNewKeyword[key][this.type] = false

        value.forEach(v => temp.push(v))
        out.push(this.proxify(temp))
      } else {
        out.push(value)
      }
    })

    return out
  }

  static proxify(x) {
    return new Proxy(x, {
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

  static get typeString() {
    if (typeof this.constructor.type === "function") {
      return this.constructor.type.name
    } else {
      return this.constructor.type
    }
  }

  get allowsSubclassInstances() {
    return this.constructor.allowsSubclassInstances
  }

  get type() {
    return this.constructor.type
  }

  canAccept(value) {
    return (
      isOfType(
        value,
        this.constructor.type,
        this.constructor.allowsSubclassInstances,
      ) ||
      (isArray(value) &&
        (value instanceof this.constructor ||
          flatten(value).every(v => this.canAccept(v))))
    )
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

  filter(fn, thisArg) {
    if (typeof thisArg !== "undefined") {
      fn = fn.bind(thisArg)
    } else {
      fn = fn.bind(this)
    }

    const out = Array.from(this).filter(fn)

    try {
      return this.constructor.from(out)
    } catch (e) {
      return Array.from(out)
    }
  }

  from() {
    return this.constructor.from(...arguments)
  }

  map(fn, thisArg) {
    if (typeof thisArg !== "undefined") {
      fn = fn.bind(thisArg)
    } else {
      fn = fn.bind(this)
    }

    const out = Array.from(this).map(fn)

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

  slice(start, end) {
    if (!start) {
      start = 0
    }

    if (!end) {
      end = this.length
    }

    const out = this.constructor.from([])

    for (let i = start; i < end; i++) {
      out.push(this[i])
    }

    return out
  }

  splice() {
    const newValues = Array.from(arguments)
      .slice(2)
      .filter(v => {
        this.challenge(v)
        return true
      })

    const difference = newValues.length - arguments[1]
    const newLength = this.length + difference

    for (let i = newLength - 1; i > arguments[0] + arguments[1]; i--) {
      this[i] = this[i - difference]
    }

    const removed = this.slice(arguments[0], arguments[0] + arguments[1])

    newValues.forEach((v, i) => {
      this[arguments[0] + i] = v
    })

    return removed
  }

  toReversed() {
    const out = this.constructor.from([])

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
  const key = allowsSubclassInstances
    ? "allowsSubclassInstances"
    : "doesNotAllowSubclassInstances"

  const typeString = typeof type === "function" ? type.name : type

  const TempClass = (() => {
    if (TypedArray.registry[key][type]) {
      return TypedArray.registry[key][type]
    } else {
      class Temp extends TypedArray {
        constructor() {
          super(type, allowsSubclassInstances)

          if (!canUseNewKeyword[key][type]) {
            throw new Error(
              `New \`${this.constructor.name}\` instances cannot be created using the \`new\` keyword! They must be created using \`${this.constructor.name}.from([...])\`.`,
            )
          }
        }
      }

      TypedArray.registry[key][type] = Temp
      return Temp
    }
  })()

  canUseNewKeyword[key][type] = true
  const out = new TempClass(true)
  canUseNewKeyword[key][type] = false

  Object.defineProperty(out.constructor, "name", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: `${pascalify(typeString)}Array`,
  })

  Object.defineProperty(TempClass, "allowsSubclassInstances", {
    configurable: true,
    enumerable: true,
    writable: false,
    value: allowsSubclassInstances,
  })

  Object.defineProperty(TempClass, "type", {
    configurable: true,
    enumerable: true,
    writable: false,
    value: type,
  })

  TypedArray.registry[key][out.constructor.name] = type
  return TypedArray.proxify(out)
}

module.exports = createTypedArray
