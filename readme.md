# Intro

This is just a little utility for creating typed arrays and typed properties on objects in JS. Obviously, there are already [some kinds of typed arrays in JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays), but they mostly deal with number types and/or raw binary data. This utility allows for the creation of typed arrays and typed properties of _any_ type.

# Installation

```bash
npm install --save https://github.com/jrc03c/js-type-experiments
```

# Usage

```js
const {
  createTypedArray,
  defineTypedProperty,
} = require("@jrc03c/js-type-experiments")

const myNumbers = createTypedArray("number")
myNumbers.push(234) // okay
myNumbers.push("Hello, world!") // error

const person = {}
defineTypedProperty(person, "string", "name")
person.name = "Alice" // okay
person.name = true // error
```

# API

## `createTypedArray(type, allowsSubclassInstances)`

The `type` argument can be a string representing a primitive type (like `"number"` or `"boolean"`) or a class name (like `Date` or a custom class).

The `allowsSubclassInstances` argument is a boolean representing whether or not the array will accept subclass instances of `type`. For example, imagine that we have a class called `Person` that has a subclass called `Employee`, and that we want to create a typed array containing only `Person` instances. Passing `true` for the `allowsSubclassInstances` argument would imply that _both_ `Person` instances _and_ `Employee` instances could be inserted into the array; whereas passing `false` for the argument would imply that _only_ `Person` (but _not_ `Employee`) instances could be inserted into the array.

## `defineTypedProperty(object, type, property, options)`

The `type` argument works the same as in the `createTypedArray` function above.

The `property` argument must be a string representing the name of the property to be created.

The `options` argument here is actually the same as the options argument passed into [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) (called `descriptor` in the MDN docs) with only one addition: it can optionally take an `"allowsSubclassInstances"` property that must be a boolean. That property has the same functionality as in the `createTypedArray` function above.
