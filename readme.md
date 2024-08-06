> ⚠️ **NOTE:** ⚠️ This project is being merged into a monorepo [here](https://github.com/jrc03c/monorepo/tree/main/packages/js-type-experiments). This repo will soon be archived.

---

# Intro

This is just a little utility for doing realtime type-checking in JS. Obviously, there are already [some kinds of typed arrays in JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays), but they mostly deal with number types and/or raw binary data. This utility allows for the creation of typed arrays and typed properties of _any_ type.

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
  isOfType,
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

console.log(isOfType(234, "number")) // true
console.log(isOfType(234, "string")) // false
```

# API

## `createType(name, fn)`

Creates a custom type defined by a pass / fail function.

A concrete example might make the purpose of this function a little clearer. Suppose we want to create an array of non-negative integers. Using the [`createTypedArray`](#createtypedarraytype-allowssubclassinstances) function below, we could try something like this:

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

The `type` argument can be a class (like `Date` or a custom class) or a string representing a primitive type (like `"number"` or `"boolean"`).

The `allowsSubclassInstances` argument is a boolean representing whether or not the array will accept subclass instances of `type`. It is `true` by default. For example, imagine that we have a class called `Person` that has a subclass called `Employee`, and that we want to create a typed array containing only `Person` instances. Passing `true` for the `allowsSubclassInstances` argument would imply that _both_ `Person` instances _and_ `Employee` instances could be inserted into the array; whereas passing `false` for the argument would imply that _only_ `Person` (but _not_ `Employee`) instances could be inserted into the array.

```js
class Person {}
class Employee extends Person {}

const personAndSubclassesArray = createTypedArray(Person, true)
const personOnlyArray = createTypedArray(Person, false)

const alice = new Employee()
personAndSubclassesArray.push(alice) // okay
personOnlyArray.push(alice) // error
```

**NOTE:** One very important thing to know about the typed arrays created via this function is that new typed arrays of the same type _cannot_ be created using the `new` keyword! For example, this will throw an error:

```js
const NumberArray = createTypedArray("number").constructor
const x = new NumberArray() // error
```

The reason for this limitation is that the typed arrays created by this function are actually wrapped in `Proxy`s — and since those can't be returned from within constructors, the constructor and the `new` keyword must be avoided. However, it's still possible to create new typed arrays using the static `from` method:

```js
const NumberArray = createTypedArray("number").constructor
const x = NumberArray.from([2, 3, 4])
const y = NumberArray.from([5, 6, 7])
const z = NumberArray.from()
```

Of course, you can also use the `createTypedArray` function multiple times in a row to create the same kinds of typed arrays:

```js
const x = createTypedArray("number")
const y = createTypedArray("number")
x.constructor === y.constructor // true
```

> **NOTE:** Another limitation of typed arrays is that they can't be subclassed. That functionality is on my to-do list, but I haven't gotten to it yet!

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

## `isOfType(value, type, allowsSubclassInstances)`

Returns a boolean indicating whether or not `value` is of type `type`. Optionally, `allowsSubclassInstances` can be set to `true` or `false` to indicate whether or not `value` is allowed to be a subclass of `type`. (This argument makes no difference for primitive types, though, since they can't be subclassed as far as I know.) For example:

```js
isOfType(3, "number") // true
isOfType(3, "string") // false
isOfType(3, Date) // false

class Person {}
class Employee extends Person {}

const alice = new Employee()
isOfType(alice, Person) // true
isOfType(alice, Person, false) // false
```

**NOTE:** Be aware that `null` and `undefined` values will match any type! For example:

```js
isOfType(undefined, "number") // true
isOfType(null, "string") // true
```

The reason for this behavior is that it's useful to be able to assign `null` or `undefined` values to (e.g.) typed arrays or typed properties such as those created with the `createTypedArray` and `defineTypedProperty` functions.

# Notes

**`NaN`, `null`, and `undefined` values:** Arrays and properties of any type will accept `null` and `undefined` values without throwing errors. Number arrays and number properties will also accept `NaN` values.
