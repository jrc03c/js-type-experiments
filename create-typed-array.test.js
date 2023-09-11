const createTypedArray = require("./create-typed-array")

test("test that the `createTypedArray` function works as expected", () => {
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

  // const objects = [
  //   [2, 3, 4],
  //   [
  //     [2, 3, 4],
  //     [5, 6, 7],
  //   ],
  //   { hello: "world" },
  //   new Date(),
  // ]

  // for (const value of objects) {
  // }

  expect(() => createTypedArray(undefined)).toThrow()
  expect(() => createTypedArray(null)).toThrow()
})
