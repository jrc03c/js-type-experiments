const { isDate } = require("@jrc03c/js-math-tools")

function isOfType(value, type, allowsSubclassInstances) {
  if (typeof allowsSubclassInstances === "undefined") {
    allowsSubclassInstances = true
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
      (allowsSubclassInstances || value.constructor.name === type.name)
    )
  } catch (e) {
    return typeof value === type
  }
}

module.exports = isOfType
