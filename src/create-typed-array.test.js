const { isEqual, range } = require("@jrc03c/js-math-tools")
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

  // nested arrays (v2)
  const z = createTypedArray("string")
  z.push("a", "b", "c")
  z.push(["d", ["e", ["f"]]])
  expect(() => z.push(234)).toThrow()

  // other methods
  const StringArray = createTypedArray("string").constructor
  const a = StringArray.from(["a", "b", "c"])
  expect(a.constructor.name).toBe("StringArray")
  expect(isEqual(a, ["a", "b", "c"])).toBe(true)
  expect(() => a.push(234)).toThrow()

  class Foo {
    constructor(value) {
      this.value = value
    }
  }

  const dTrue = range(0, 6).map(v => new Foo(v))
  const b = createTypedArray(Foo).from(dTrue.slice(0, 3))
  const c = createTypedArray(Foo).from(dTrue.slice(3))
  const dPred = b.concat(c)
  expect(isEqual(dTrue, dPred)).toBe(true)
  expect(dPred.type).toBe(b.type)
  expect(dPred.constructor.name).toBe("FooArray")

  const e = createTypedArray("number").from([2, 3, 4])
  e.fill(234, 0, 2)
  expect(isEqual(e, [234, 234, 4])).toBe(true)
  expect(e.type).toBe("number")
  expect(e.constructor.name).toBe("NumberArray")

  const gTrue = [4, 6, 8]
  const f = createTypedArray("number").from([2, 3, 4])
  const gPred = f.map(v => v * 2)
  expect(isEqual(gTrue, gPred)).toBe(true)
  expect(gPred.type).toBe(f.type)
  expect(gPred.constructor.name).toBe("NumberArray")

  const h = f.map(v => v.toString())
  expect(isEqual(h, ["2", "3", "4"])).toBe(true)
  expect(h instanceof f.constructor).toBe(false)

  expect(f.slice() instanceof f.constructor).toBe(true)
  expect(f.slice(0, 1) instanceof f.constructor).toBe(true)

  const i = f.toReversed()
  expect(i instanceof f.constructor).toBe(true)

  expect(
    i.forEach((v, j) => {
      expect(isEqual(v, f.at(-j - 1))).toBe(true)
    }),
  )

  const j = createTypedArray("string").from(["c", "a", "b"])
  const k = j.toSorted()
  expect(k instanceof j.constructor).toBe(true)
  expect(isEqual(k, ["a", "b", "c"])).toBe(true)
  const l = j.toSorted((a, b) => (b < a ? -1 : 1))
  expect(l instanceof j.constructor).toBe(true)
  expect(isEqual(l, ["c", "b", "a"])).toBe(true)
  j.sort()
  expect(isEqual(j, k)).toBe(true)
  j.sort((a, b) => (b < a ? -1 : 1))
  expect(isEqual(j, l)).toBe(true)

  const m = createTypedArray("symbol").from([
    Symbol.for("yes"),
    Symbol.for("no"),
    Symbol.for("maybe-so"),
  ])

  const n = m.toSpliced(0, 1, Symbol.for("hell no"))
  m.splice(0, 1, Symbol.for("hell no"))
  expect(isEqual(m, n)).toBe(true)
  expect(n instanceof m.constructor).toBe(true)

  const o = createTypedArray("number").from([2, 3, 4])
  o.unshift(5, 6, 7)
  expect(isEqual(o, [5, 6, 7, 2, 3, 4])).toBe(true)

  const p = createTypedArray("number").from([2, 3, 4])
  const q = p.with(1, 234)
  expect(isEqual(q, [2, 234, 4])).toBe(true)
  expect(q instanceof p.constructor).toBe(true)
})
