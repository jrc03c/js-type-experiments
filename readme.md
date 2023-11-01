# Intro

This is just a little utility for creating typed arrays and typed properties on objects in JS. Obviously, there are already [some kinds of typed arrays in JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays), but they mostly deal with number types and/or raw binary data. This utility allows for the creation of typed arrays and typed properties of _any_ type.

# Installation

```bash
npm install --save https://github.com/jrc03c/js-type-experiments
```

# Usage

```js
const {
  createType,
  createTypedArray,
  defineTypedProperty,
} = require("@jrc03c/js-type-experiments")

const fooType = createType("Foo", v => v === "foo")
console.log("foo" instanceof fooType) // true
console.log("bar" instanceof fooType) // false

const myNumbers = createTypedArray("number")
myNumbers.push(234) // okay
myNumbers.push("Hello, world!") // error

const person = {}
defineTypedProperty(person, "name", "string")
person.name = "Alice" // okay
person.name = true // error
```

# API

## `createType(name, fn)`

Creates a custom type defined by a pass / fail function.

A concrete example might make the purpose of this function a little clearer. Suppose we want to create an array of non-negative integers. Using the `createTypedArray` function below, we could try something like this:

```js
const x = createTypedArray("number")
```

But the problem, of course, is that `x` would accept _any_ number, not just non-negative integers. And that's where the `createType` function comes to the rescue. It allows us to define a custom type without creating a whole new class (which is especially helpful for primitive values that don't use classes) merely by passing a name and a test function that tests each value to determine whether it's a member of that type or not. So, to create an array of non-negative integers, we could do something like this:

```js
function isANonNegativeInteger(x) {
  return typeof x === "number" && x >= 0 && Math.floor(x) === x
}

const nonNegativeIntegerType = createType("NonNegInt", isANonNegativeInteger)
const x = createTypedArray(nonNegativeIntegerType)
x.push(234) // okay
x.push(-234) // error
```

## `createTypedArray(type, allowsSubclassInstances)`

The `type` argument can be a string representing a primitive type (like `"number"` or `"boolean"`) or a class name (like `Date` or a custom class).

The `allowsSubclassInstances` argument is a boolean representing whether or not the array will accept subclass instances of `type`. For example, imagine that we have a class called `Person` that has a subclass called `Employee`, and that we want to create a typed array containing only `Person` instances. Passing `true` for the `allowsSubclassInstances` argument would imply that _both_ `Person` instances _and_ `Employee` instances could be inserted into the array; whereas passing `false` for the argument would imply that _only_ `Person` (but _not_ `Employee`) instances could be inserted into the array.

## `defineTypedProperty(object, property, type, options)`

The `property` argument must be a string representing the name of the property to be created.

The `type` argument works the same as in the `createTypedArray` function above.

The `options` argument here is actually the same as the options argument passed into [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) (called `descriptor` in the MDN docs) with only one addition: it can optionally take an `"allowsSubclassInstances"` property that must be a boolean. That property has the same functionality as in the `createTypedArray` function above.

By the way, here's a useful little recipe if you need to define a property whose type is a typed array. For example, in a class called `Person`, there might be a property called `nicknames` that's supposed to be an array of (only) strings. To define such a property, do this:

```js
const {
  createTypedArray,
  defineTypedProperty,
} = require("@jrc03c/js-type-experiments")

class Person {
  constructor() {
    // ...

    defineTypedProperty(
      this,
      "nicknames",
      createTypedArray("string").constructor,
    )

    // ...
  }
}
```

In other words, we create a temporary typed array using the `createTypedArray` function, specifying `"string"` as the type, and then immediately use the `constructor` of that array since that's the "type" of value — i.e., the `StringArray` type — that the property `nicknames` should accept.

# Notes

**`NaN`, `null`, and `undefined` values:** Arrays and properties of any type will accept `null` and `undefined` values without throwing errors. Number arrays and number properties will also accept `NaN` values.

**Nested typed arrays:** Typed arrays can be nested, but the syntax is a little cumbersome right now. To create (for example) a nested string array, you'd have to do something like this:

```js
const outer = createTypedArray("string")
outer.push("a", "b", "c")

const inner = createTypedArray("string")
outer.push(inner)
```
