const createType = require("./create-type")

test("test that the `createType` function works as expected", () => {
  const variables = [
    0,
    1,
    2.3,
    -2.3,
    Infinity,
    -Infinity,
    "foo",
    true,
    false,
    null,
    undefined,
    Symbol.for("Hello, world!"),
    [2, 3, 4],
    [
      [2, 3, 4],
      [5, 6, 7],
    ],
    x => x,
    function (x) {
      return x
    },
    { hello: "world" },
    new Date(),
  ]

  for (const value of variables) {
    const type = createType("Whatevs", other => other === value)
    expect(value instanceof type).toBe(true)

    for (const other of variables) {
      if (other !== value) {
        expect(other instanceof type).toBe(false)
      }
    }
  }

  for (const value of variables) {
    if (typeof value !== "string") {
      expect(() => createType(value, () => true)).toThrow()
    }

    if (typeof value !== "function") {
      expect(() => createType("Whatevs", value)).toThrow()
    }
  }
})
