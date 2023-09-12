const createTypedArray = require("./create-typed-array")

test("test that the `createTypedArray` function works as expected", () => {
  // primitive array types
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
    const arr = createTypedArray(typeof value)
    arr.push(value)

    for (const other of primitives) {
      let failed = false

      try {
        arr.push(other)
      } catch (e) {
        failed = true
      }

      expect(failed).toBe(typeof other !== typeof value)
    }
  }

  // undefined array types
  expect(() => createTypedArray(undefined)).toThrow()
  expect(() => createTypedArray(null)).toThrow()

  // appending undefined or null values to arrays of any type
  expect(() => {
    const x = createTypedArray("string")
    x.push(undefined)
    x.push(null)
    x.push("foo")
  }).not.toThrow()

  // appending NaN to number arrays
  expect(() => {
    const x = createTypedArray("number")
    x.push(undefined)
    x.push(null)
    x.push(NaN)
    x.push(234)
  }).not.toThrow()

  // array array types
  expect(() => createTypedArray(Array)).toThrow()

  // object array types
  const dateArray = createTypedArray(Date)
  dateArray.push(new Date())
  dateArray.push(new Date(new Date().getTime() + 1000))

  for (const value of primitives) {
    let failed = false

    try {
      dateArray.push(value)
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

  const personArray = createTypedArray(Person)
  personArray.push(alice)
  personArray.push(bob)

  for (const value of primitives) {
    let failed = false

    try {
      personArray.push(value)
    } catch (e) {
      failed = true
    }

    expect(failed).toBe(true)
  }

  const personOnlyArray = createTypedArray(Person, false)
  personOnlyArray.push(alice)
  expect(() => personOnlyArray.push(bob)).toThrow()

  const employeeArray = createTypedArray(Employee)
  employeeArray.push(bob)
  expect(() => employeeArray.push(alice)).toThrow()

  const genericObjectArray = createTypedArray(Object)
  genericObjectArray.push(alice)
  genericObjectArray.push(bob)
  genericObjectArray.push({ hello: "world" })

  // nested arrays
  const x = createTypedArray("number")
  const y = createTypedArray("number")
  x.push(2, 3, 4)
  y.push(5, 6, 7)
  x.push(y)
})
