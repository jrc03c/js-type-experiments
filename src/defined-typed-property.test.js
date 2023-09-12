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
    defineTypedProperty(x, typeof value, prop)

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
    defineTypedProperty({}, undefined, Math.random().toString()),
  ).toThrow()

  expect(() =>
    defineTypedProperty({}, null, Math.random().toString()),
  ).toThrow()

  // array types
  expect(() =>
    defineTypedProperty({}, null, Math.random().toString()),
  ).toThrow()

  // typed array types
  expect(() => {
    defineTypedProperty(
      {},
      createTypedArray("number").constructor,
      Math.random().toString(),
    )
  }).not.toThrow()

  // object types
  const x = {}
  const prop = Math.random().toString()
  defineTypedProperty(x, Date, prop)
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
  defineTypedProperty(x2, Person, prop2)

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
  defineTypedProperty(x2, Person, prop3, { allowsSubclassInstances: false })

  x2[prop3] = alice

  expect(() => {
    x2[prop3] = bob
  }).toThrow()

  const prop4 = Math.random().toString()
  defineTypedProperty(x2, Employee, prop4)

  x2[prop4] = bob

  expect(() => {
    x2[prop4] = alice
  }).toThrow()

  const prop5 = Math.random().toString()
  defineTypedProperty(x, Object, prop5)

  x2[prop5] = alice
  x2[prop5] = bob
  x2[prop5] = { hello: "world" }
})
