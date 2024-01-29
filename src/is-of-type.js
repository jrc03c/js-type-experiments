const { isArray, isDate } = require("@jrc03c/js-math-tools")

function isOfType(value, type, allowSubclassInstances) {
  if (typeof allowSubclassInstances === "undefined") {
    allowSubclassInstances = true
  }

  if (isArray(value) && type === Array) {
    return true
  }

  if (value === null || typeof value === "undefined") {
    return true
  }

  if (type === "number" && typeof value === "number" && isNaN(value)) {
    return true
  }

  if (type === Date && isDate(value)) {
    return true
  }

  try {
    return (
      value instanceof type &&
      (allowSubclassInstances || value.constructor.name === type.name)
    )
  } catch (e) {
    return typeof value === type
  }
}

module.exports = isOfType
