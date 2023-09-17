const createTypedArray = require("./create-typed-array")
const defineTypedProperty = require("./define-typed-property")

test("test that the `defineTypedProperty` function works as expected", () => {
  // primitive types
  const primitives = [
    0,
    1,
    2.3,
    -2.3,
    Infinity,
    -Infinity,
    NaN,
    "foo",
    true,
    false,
    Symbol.for("Hello, world!"),
    x => x,
    function (x) {
      return x
    },
  ]

  for (const value of primitives) {
    const x = {}
    const prop = Math.random().toString()
    defineTypedProperty(x, prop, typeof value)

    for (const other of primitives) {
      let failed = false

      try {
        x[prop] = other
      } catch (e) {
        failed = true
      }

      expect(failed).toBe(typeof other !== typeof value)
    }
  }

  // undefined types
  expect(() =>
    defineTypedProperty({}, Math.random().toString(), undefined),
  ).toThrow()

  expect(() =>
    defineTypedProperty({}, Math.random().toString(), null),
  ).toThrow()

  // setting undefined or null values on typed properties
  expect(() => {
    const x = {}
    defineTypedProperty(x, "foo", "string")
    x.foo = undefined
    x.foo = null
    x.foo = "bar"
  }).not.toThrow()

  // setting NaN on number properties
  expect(() => {
    const x = {}
    defineTypedProperty(x, "foo", "number")
    x.foo = undefined
    x.foo = null
    x.foo = NaN
    x.foo = 234
  }).not.toThrow()

  // array types
  expect(() =>
    defineTypedProperty({}, Math.random().toString(), null),
  ).toThrow()

  // typed array types
  expect(() => {
    defineTypedProperty(
      {},
      Math.random().toString(),
      createTypedArray("number").constructor,
    )
  }).not.toThrow()

  // object types
  const x = {}
  const prop = Math.random().toString()
  defineTypedProperty(x, prop, Date)
  x[prop] = new Date()
  x[prop] = new Date(new Date().getTime() + 1000)

  for (const value of primitives) {
    let failed = false

    try {
      x[prop] = value
    } catch (e) {
      failed = true
    }

    expect(failed).toBe(true)
  }

  class Person {
    constructor(name, age) {
      this.name = name
      this.age = age
    }
  }

  class Employee extends Person {
    constructor(name, age, title) {
      super(name, age)
      this.title = title
    }
  }

  const alice = new Person("Alice", 23)
  const bob = new Employee("Bob", 45, "Transpondster")
  const x2 = {}
  const prop2 = Math.random().toString()
  defineTypedProperty(x2, prop2, Person)

  x2[prop2] = alice
  x2[prop2] = bob

  for (const value of primitives) {
    let failed = false

    try {
      x2[prop2] = value
    } catch (e) {
      failed = true
    }

    expect(failed).toBe(true)
  }

  const prop3 = Math.random().toString()
  defineTypedProperty(x2, prop3, Person, { allowsSubclassInstances: false })

  x2[prop3] = alice

  expect(() => {
    x2[prop3] = bob
  }).toThrow()

  const prop4 = Math.random().toString()
  defineTypedProperty(x2, prop4, Employee)

  x2[prop4] = bob

  expect(() => {
    x2[prop4] = alice
  }).toThrow()

  const prop5 = Math.random().toString()
  defineTypedProperty(x, prop5, Object)

  x2[prop5] = alice
  x2[prop5] = bob
  x2[prop5] = { hello: "world" }
})
