export function compareValue(guess, target, type) {
  if (guess == null || target == null) {
    return { status: "wrong", display: "—" }
  }

  // STRING
  if (type === "string") {
    if (guess === target) {
      return { status: "correct", display: guess }
    }
    return { status: "wrong", display: guess }
  }

  // NUMBER (age, height)
  if (type === "number") {
    if (guess === target) {
      return { status: "correct", display: guess }
    }

    return {
      status: "partial",
      display: guess,
      arrow: guess < target ? "↑" : "↓"
    }
  }

  // ARRAY (occupation, affiliation)
  if (type === "array") {
    const common = guess.filter(v => target.includes(v))

    if (common.length === 0) {
      return { status: "wrong", display: guess.join(", ") }
    }

    if (common.length === target.length && guess.length === target.length) {
      return { status: "correct", display: guess.join(", ") }
    }

    return {
      status: "partial",
      display: common.join(", ")
    }
  }

  return { status: "wrong", display: guess }
}
