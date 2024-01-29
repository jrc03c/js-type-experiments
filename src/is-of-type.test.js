const createType = require("./create-type")
const isOfType = require("./is-of-type")

test("tests that the `isOfType` function works as expected", () => {
  // check correct types
  const selfReferencer = [2, 3, 4]
  selfReferencer.push(selfReferencer)

  const rights = [
    [0, "number"],
    [1, "number"],
    [2.3, "number"],
    [-2.3, "number"],
    [Infinity, "number"],
    [-Infinity, "number"],
    [NaN, "number"],
    [234n, "bigint"],
    ["foo", "string"],
    [true, "boolean"],
    [false, "boolean"],
    [null, "object"],
    [undefined, "undefined"],
    [Symbol.for("Hello, world!"), "symbol"],
    [[2, 3, 4], Array],
    [
      [
        [2, 3, 4],
        [5, 6, 7],
      ],
      Array,
    ],
    [x => x, "function"],
    [
      function (x) {
        return x
      },
      "function",
    ],
    [{ hello: "world" }, "object"],
    [new Date(), Date],
    [selfReferencer, Array],
  ]

  for (const pair of rights) {
    expect(isOfType(pair[0], pair[1])).toBe(true)
  }

  // check custom number types
  const WholeNumber = createType(
    "WholeNumber",
    v => typeof v === "number" && !isNaN(v) && v >= 0 && Math.floor(v) === v,
  )

  const NaturalNumber = createType(
    "WholeNumber",
    v => typeof v === "number" && !isNaN(v) && v > 0 && Math.floor(v) === v,
  )

  expect(isOfType(234, WholeNumber)).toBe(true)
  expect(isOfType(234, NaturalNumber)).toBe(true)
  expect(isOfType(0, WholeNumber)).toBe(true)
  expect(isOfType(0, NaturalNumber)).toBe(false)
  expect(isOfType(-234, WholeNumber)).toBe(false)
  expect(isOfType(-234, NaturalNumber)).toBe(false)
  expect(isOfType(234.567, WholeNumber)).toBe(false)
  expect(isOfType(234.567, NaturalNumber)).toBe(false)

  // check any type
  const AnyType = createType("Any", () => true)

  for (const pair of rights) {
    expect(isOfType(pair[0], AnyType)).toBe(true)
  }

  // check that undefined and null match any type
  const allTypes = [
    "bigint",
    "boolean",
    "function",
    "number",
    "object",
    "string",
    "symbol",
    Array,
    Date,
  ]

  for (const type of allTypes) {
    expect(isOfType(null, type)).toBe(true)
    expect(isOfType(undefined, type)).toBe(true)
  }

  // check wrong types
  const wrongs = [
    [
      0,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      1,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      2.3,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      -2.3,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      Infinity,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      -Infinity,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      NaN,
      [
        "bigint",
        "boolean",
        "function",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      234n,
      [
        "boolean",
        "function",
        "number",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      "foo",
      [
        "bigint",
        "boolean",
        "function",
        "number",
        "object",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      true,
      [
        "bigint",
        "function",
        "number",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      false,
      [
        "bigint",
        "function",
        "number",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      Symbol.for("Hello, world!"),
      [
        "bigint",
        "boolean",
        "function",
        "number",
        "object",
        "string",
        Array,
        Date,
      ],
    ],
    [
      [2, 3, 4],
      ["bigint", "boolean", "function", "number", "string", "symbol", Date],
    ],
    [
      [
        [2, 3, 4],
        [5, 6, 7],
      ],
      ["bigint", "boolean", "function", "number", "string", "symbol", Date],
    ],
    [
      x => x,
      [
        "bigint",
        "boolean",
        "number",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      function (x) {
        return x
      },
      [
        "bigint",
        "boolean",
        "number",
        "object",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      { hello: "world" },
      [
        "bigint",
        "boolean",
        "function",
        "number",
        "string",
        "symbol",
        Array,
        Date,
      ],
    ],
    [
      new Date(),
      ["bigint", "boolean", "function", "number", "string", "symbol", Array],
    ],
    [
      selfReferencer,
      ["bigint", "boolean", "function", "number", "string", "symbol", Date],
    ],
  ]

  for (const pair of wrongs) {
    for (const type of pair[1]) {
      expect(isOfType(pair[0], type)).toBe(false)
    }
  }
})
